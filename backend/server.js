import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "frostpitchsecretkey_change_me_in_prod";

// Configure database connection settings
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "frostpitch",
  dateStrings: true, // Returns dates as strings to avoid timezone shifts
};

// Middleware
app.use(cors());
app.use(express.json());

let pool;

// Dynamic database schema creation & validation
async function initializeDatabase() {
  try {
    // 1. Establish initial connection without database name to ensure it exists
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await tempConnection.end();

    // 2. Initialize connection pool with database name
    pool = mysql.createPool(dbConfig);

    // 3. Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('player', 'admin') NOT NULL DEFAULT 'player',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Create bookings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(50) PRIMARY KEY,
        date DATE NOT NULL,
        time VARCHAR(10) NOT NULL,
        duration INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NULL,
        team VARCHAR(255) NULL,
        notes TEXT NULL,
        status ENUM('confirmed', 'cancelled', 'pending') NOT NULL DEFAULT 'confirmed',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Run Database Migration: Add 'userId' foreign key column to 'bookings' if missing
    const [columns] = await pool.query("SHOW COLUMNS FROM bookings LIKE 'userId'");
    if (columns.length === 0) {
      console.log("Migrating bookings database: Adding userId column...");
      await pool.query("ALTER TABLE bookings ADD COLUMN userId VARCHAR(50) NULL");
      await pool.query("ALTER TABLE bookings ADD CONSTRAINT fk_booking_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL");
      console.log("Migration completed successfully.");
    }

    console.log("Connected to MySQL Database and verified table schema successfully.");

    // 6. Seed Default Users (Admin and Player) if empty
    const [countUsers] = await pool.query("SELECT COUNT(*) as count FROM users");
    if (countUsers[0].count === 0) {
      console.log("Seeding default system users...");
      
      const adminPasswordHashed = await bcrypt.hash("adminpassword", 10);
      const playerPasswordHashed = await bcrypt.hash("playerpassword", 10);

      await pool.query(
        "INSERT INTO users (id, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)",
        ["USR-ADMIN", "FrostPitch Admin", "admin@frostpitch.in", "+91 99999 88888", adminPasswordHashed, "admin"]
      );

      await pool.query(
        "INSERT INTO users (id, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)",
        ["USR-1001", "Amit Patel", "amit@yahoo.com", "+91 87654 32109", playerPasswordHashed, "player"]
      );
      
      console.log("Default users seeded successfully.");
    }

    // 7. Seed initial bookings if database table is empty
    const [countRows] = await pool.query("SELECT COUNT(*) as count FROM bookings");
    if (countRows[0].count === 0) {
      console.log("Database table is empty. Seeding initial bookings...");
      const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const initialBookings = [
        {
          id: "BK-1001",
          date: todayStr,
          time: "10:00",
          duration: 2,
          name: "Rahul Sharma",
          phone: "+91 98765 12345",
          email: "rahul@gmail.com",
          team: "Bhilwara Royals",
          notes: "Need extra bats and water.",
          status: "confirmed",
          userId: null,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString().slice(0, 19).replace('T', ' '),
        },
        {
          id: "BK-1002",
          date: todayStr,
          time: "18:00",
          duration: 1,
          name: "Amit Patel",
          phone: "+91 87654 32109",
          email: "amit@yahoo.com",
          team: "Corporate XI",
          notes: "Scoreboard setup and music system required.",
          status: "confirmed",
          userId: "USR-1001",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString().slice(0, 19).replace('T', ' '),
        },
        {
          id: "BK-1003",
          date: tomorrowStr,
          time: "20:00",
          duration: 2,
          name: "Suresh Raina",
          phone: "+91 76543 21098",
          email: "suresh@company.com",
          team: "Super Kings",
          notes: "Tournament planning.",
          status: "pending",
          userId: null,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString().slice(0, 19).replace('T', ' '),
        },
      ];

      for (const b of initialBookings) {
        await pool.query(
          "INSERT INTO bookings (id, date, time, duration, name, phone, email, team, notes, status, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [b.id, b.date, b.time, b.duration, b.name, b.phone, b.email, b.team, b.notes, b.status, b.userId, b.createdAt]
        );
      }
      console.log("Mock data seeded successfully.");
    }
  } catch (err) {
    console.error("Failed to initialize MySQL Database:", err);
    console.error("Please make sure your local MySQL server is running and configured correctly in backend/.env");
    process.exit(1);
  }
}

// Authentication Token Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Session expired or invalid token" });
    }
    req.user = decoded;
    next();
  });
}

// Optional Auth Middleware (doesn't fail if token is missing, just populates req.user)
function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
    }
    next();
  });
}

// Conflict validation helper
function hasConflict(b1, b2) {
  const start1 = new Date(`${b1.date}T${b1.time}:00`).getTime();
  const end1 = start1 + b1.duration * 60 * 60 * 1000;
  
  const start2 = new Date(`${b2.date}T${b2.time}:00`).getTime();
  const end2 = start2 + b2.duration * 60 * 60 * 1000;

  return Math.max(start1, start2) < Math.min(end1, end2);
}

// ================= API Routes =================

// ----- Auth Routes -----

// 1. POST /api/auth/signup
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if email or phone already exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ? OR phone = ?", [email, phone]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "User with this email or phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `USR-${randomNum}`;

    await pool.query(
      "INSERT INTO users (id, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      [newId, name, email, phone, hashedPassword, "player"]
    );

    const userPayload = { id: newId, name, email, phone, role: "player" };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({ user: userPayload, token });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error during registration" });
  }
});

// 2. POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Find user by email or phone
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? OR phone = ?", [email, email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email/phone or password" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email/phone or password" });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ user: userPayload, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error during login" });
  }
});

// 3. GET /api/auth/me
app.get("/api/auth/me", authenticateToken, (req, res) => {
  return res.json(req.user);
});

// ----- Booking Routes -----

// 4. GET /api/bookings/slots?date=YYYY-MM-DD&duration=X
app.get("/api/bookings/slots", async (req, res) => {
  const { date, duration } = req.query;
  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }

  const requestedDuration = Number(duration) || 1;

  try {
    const [activeBookings] = await pool.query(
      "SELECT date, time, duration FROM bookings WHERE date = ? AND status != 'cancelled'",
      [date]
    );

    const candidateTimes = [
      "06:00", "08:00", "10:00", "12:00", "14:00", 
      "16:00", "18:00", "20:00", "22:00", "00:00"
    ];

    const bookedSlots = [];

    for (const time of candidateTimes) {
      const candidateBooking = { date, time, duration: requestedDuration };
      const isBooked = activeBookings.some((existingBooking) =>
        hasConflict(candidateBooking, existingBooking)
      );
      if (isBooked) {
        bookedSlots.push(time);
      }
    }

    return res.json(bookedSlots);
  } catch (err) {
    console.error("Database query error on slots:", err);
    return res.status(500).json({ error: "Internal server error querying slots" });
  }
});

// 5. POST /api/bookings
app.post("/api/bookings", optionalAuthenticateToken, async (req, res) => {
  const { date, time, duration, name, phone, email, team, notes } = req.body;

  if (!date || !time || !duration || !name || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const bookingDuration = Number(duration);
  const userId = req.user ? req.user.id : null;

  try {
    const [activeBookings] = await pool.query(
      "SELECT date, time, duration FROM bookings WHERE date = ? AND status != 'cancelled'",
      [date]
    );

    // Check overlap conflict
    const conflict = activeBookings.some((existing) =>
      hasConflict({ date, time, duration: bookingDuration }, existing)
    );

    if (conflict) {
      return res.status(409).json({ error: "This slot is already booked or overlaps with an existing booking." });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `BK-${randomNum}`;

    await pool.query(
      "INSERT INTO bookings (id, date, time, duration, name, phone, email, team, notes, status, userId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        newId, 
        date, 
        time, 
        bookingDuration, 
        name, 
        phone, 
        email || null, 
        team || null, 
        notes || null, 
        "confirmed", 
        userId,
        new Date().toISOString().slice(0, 19).replace('T', ' ')
      ]
    );

    const [newBookingRows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [newId]);

    return res.status(201).json(newBookingRows[0]);
  } catch (err) {
    console.error("Database error saving booking:", err);
    return res.status(500).json({ error: "Internal server error saving booking" });
  }
});

// 6. GET /api/bookings/my-bookings
app.get("/api/bookings/my-bookings", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM bookings WHERE userId = ? ORDER BY date DESC, time DESC",
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("Database error retrieving personal bookings:", err);
    return res.status(500).json({ error: "Internal server error retrieving personal bookings" });
  }
});

// 7. GET /api/bookings (Admin Only)
app.get("/api/bookings", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Administrative access required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM bookings ORDER BY date DESC, time DESC");
    return res.json(rows);
  } catch (err) {
    console.error("Database error retrieving bookings:", err);
    return res.status(500).json({ error: "Internal server error retrieving bookings" });
  }
});

// 8. POST /api/bookings/:id/status
app.post("/api/bookings/:id/status", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["confirmed", "cancelled", "pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid or missing status" });
  }

  try {
    // Get the existing booking
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = rows[0];

    // Access control: admins can update anything, players can only cancel their own bookings
    if (req.user.role !== "admin") {
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden: You can only manage your own bookings" });
      }
      if (status !== "cancelled") {
        return res.status(403).json({ error: "Forbidden: You are only allowed to cancel your booking" });
      }

      // Check cancellation deadline (cancellable up to 12 hours before start time)
      const slotStartTime = new Date(`${booking.date}T${booking.time}:00`).getTime();
      const twelveHoursInMs = 12 * 60 * 60 * 1000;
      if (slotStartTime - Date.now() < twelveHoursInMs) {
        return res.status(400).json({ error: "Cancellations must be made at least 12 hours in advance of the booking." });
      }
    }

    await pool.query("UPDATE bookings SET status = ? WHERE id = ?", [status, id]);
    
    const [updated] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error("Database error updating status:", err);
    return res.status(500).json({ error: "Internal server error updating booking status" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// Initialize database and start listening
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`FrostPitch MySQL Auth backend server is running on http://localhost:${PORT}`);
  });
});
