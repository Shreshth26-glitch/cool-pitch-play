const API_BASE = "http://localhost:5000/api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "player" | "admin";
  createdAt: string;
}

export interface Booking {
  id: string;
  date: string;
  time: string;
  duration: number;
  name: string;
  phone: string;
  email?: string;
  team?: string;
  notes?: string;
  status: "confirmed" | "cancelled" | "pending";
  userId?: string;
  createdAt: string;
}

// 1. Auth: Sign Up
export async function signUpUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    let errMessage = "Signup failed";
    try {
      const parsed = JSON.parse(text);
      errMessage = parsed.error || errMessage;
    } catch {}
    throw new Error(errMessage);
  }

  return res.json();
}

// 2. Auth: Log In
export async function logInUser(data: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    let errMessage = "Login failed";
    try {
      const parsed = JSON.parse(text);
      errMessage = parsed.error || errMessage;
    } catch {}
    throw new Error(errMessage);
  }

  return res.json();
}

// 3. Auth: Fetch Current User
export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    let errMessage = "Failed to load session";
    try {
      const parsed = JSON.parse(text);
      errMessage = parsed.error || errMessage;
    } catch {}
    throw new Error(errMessage);
  }

  return res.json();
}

// 4. Slots: Fetch Booked Slots
export async function getBookedSlots(data: { date: string; duration: number }): Promise<string[]> {
  const res = await fetch(`${API_BASE}/bookings/slots?date=${encodeURIComponent(data.date)}&duration=${data.duration}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch booked slots");
  }
  return res.json();
}

// 5. Bookings: Create Booking
export async function createBooking(
  data: {
    date: string;
    time: string;
    duration: number;
    name: string;
    phone: string;
    email?: string;
    team?: string;
    notes?: string;
  },
  token?: string
): Promise<Booking> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = "Failed to create booking";
    try {
      const parsed = JSON.parse(text);
      errorMessage = parsed.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}

// 6. Bookings: Fetch Player's Bookings
export async function getMyBookings(token: string): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/bookings/my-bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = "Failed to retrieve personal bookings";
    try {
      const parsed = JSON.parse(text);
      errorMessage = parsed.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}

// 7. Bookings: Retrieve All Bookings (Admin)
export async function getAllBookings(token: string): Promise<Booking[]> {
  const res = await fetch(`${API_BASE}/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const text = await res.text();
    let errorMessage = "Failed to retrieve bookings";
    try {
      const parsed = JSON.parse(text);
      errorMessage = parsed.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}

// 8. Bookings: Update Booking Status (Admin or Owner)
export async function updateBookingStatus(
  id: string,
  status: "confirmed" | "cancelled" | "pending",
  token: string
): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = "Failed to update booking status";
    try {
      const parsed = JSON.parse(text);
      errorMessage = parsed.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}
