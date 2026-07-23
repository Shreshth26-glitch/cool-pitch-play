# 🏟️ Cool Pitch Play

A full-stack turf booking platform that lets users reserve sports turfs on an hourly basis, with a dedicated admin panel for managing listings and bookings.

## Features

- **Hourly Slot Booking** — Users can browse available turfs and book time slots by the hour
- **Admin Panel** — Admins can create, edit, and manage turf listings and view/manage bookings
- **Booking Management** — Real-time tracking of reserved vs. available slots to prevent double-booking
- **Role-Based Access** — Separate user and admin experiences with protected routes

## Tech Stack

**Frontend**
- React + TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn/ui components

**Backend**
- Node.js
- TypeScript

**Tooling**
- Bun (package manager & runtime)
- ESLint + Prettier (code quality & formatting)

## Project Structure

```
cool-pitch-play/
├── backend/        # API and server logic
├── public/         # Static assets
├── src/            # Frontend application source
├── components.json # shadcn/ui configuration
└── vite.config.ts  # Vite build configuration
```

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed on your machine

### Installation

```bash
# Clone the repository
git clone https://github.com/Shreshth26-glitch/cool-pitch-play.git
cd cool-pitch-play

# Install dependencies
bun install

# Start the development server
bun run dev
```

The app should now be running locally — check your terminal output for the exact URL and port.

### Environment Variables

If the backend requires database credentials or API keys, create a `.env` file in the `backend/` directory (see `.env.example` if provided, or check `backend/` for required variables).

## Roadmap

- [ ] Payment gateway integration for online booking
- [ ] Email/SMS booking confirmations
- [ ] Turf availability calendar view
- [ ] Reviews and ratings for turfs

## License

This project is open for learning and demonstration purposes.

---

Built by [Shreshth Swami](https://github.com/Shreshth26-glitch)
