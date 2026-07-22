import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { getMyBookings, updateBookingStatus, type Booking } from "../lib/api-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar as CalendarIcon, Clock, LogOut, RefreshCw, Snowflake, Trophy, XCircle } from "lucide-react";

export const Route = createFileRoute("/my-bookings")({
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const { user, token, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please log in to view your bookings");
      navigate({ to: "/login" });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchUserBookings = async (authToken: string) => {
    setIsLoading(true);
    try {
      const data = await getMyBookings(authToken);
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserBookings(token);
    }
  }, [token]);

  const handleCancelBooking = async (id: string) => {
    if (!token) return;

    const originalBookings = [...bookings];

    // Optimistic UI update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );

    try {
      await updateBookingStatus(id, "cancelled", token);
      toast.success("Booking cancelled successfully. Your refund request is being processed.");
      fetchUserBookings(token); // Reload updated database state
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to cancel booking. Note that cancellations must be requested at least 12 hours in advance.");
      // Rollback
      setBookings(originalBookings);
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  // Helper to check if a booking is cancellable (at least 12 hours before starting)
  const isCancellable = (booking: Booking) => {
    if (booking.status === "cancelled") return false;
    const startTimestamp = new Date(`${booking.date}T${booking.time}:00`).getTime();
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    return startTimestamp - Date.now() > twelveHoursInMs;
  };

  if (authLoading || (!isAuthenticated && authLoading)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground mt-3">Loading account data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 h-[40vh] w-96 blur-3xl opacity-10" style={{ background: "radial-gradient(circle, oklch(0.80 0.14 78), transparent 70%)" }} />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 13l4 4L20 7" />
            </svg>
            <div>
              <div className="text-xs font-bold tracking-wider leading-none">DON BOSCO</div>
              <div className="text-[8px] uppercase tracking-[0.25em] text-muted-foreground">User Dashboard</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {token && (
              <Button 
                onClick={() => fetchUserBookings(token)} 
                variant="outline" 
                size="sm" 
                disabled={isLoading}
                className="rounded-full border-border glass text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            )}
            <Button 
              onClick={handleLogout} 
              variant="destructive" 
              size="sm" 
              className="rounded-full bg-destructive/20 border border-destructive/30 hover:bg-destructive/40 text-destructive text-xs"
            >
              <LogOut className="h-3 w-3 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 mt-10">
        <div className="grid md:grid-cols-4 gap-6 items-start">
          {/* User Profile Card */}
          {user && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-1 rounded-3xl glass p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/25 text-primary grid place-items-center font-bold text-xl mx-auto mb-3">
                  {user.name.split(" ").map(w => w[0]).join("")}
                </div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <span className="inline-block mt-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-muted-foreground">
                  {user.role} Member
                </span>
              </div>

              <div className="space-y-3 text-xs text-muted-foreground border-t border-border pt-4">
                <div>
                  <div className="uppercase tracking-widest text-[9px] text-muted-foreground/60 mb-0.5">Email</div>
                  <div className="text-foreground font-medium break-all">{user.email}</div>
                </div>
                <div>
                  <div className="uppercase tracking-widest text-[9px] text-muted-foreground/60 mb-0.5">Phone</div>
                  <div className="text-foreground font-medium">{user.phone}</div>
                </div>
                {user.role === "admin" && (
                  <div className="pt-2">
                    <Link to="/admin">
                      <Button size="sm" className="w-full rounded-full bg-primary text-primary-foreground font-semibold text-xs">
                        Open Admin Panel
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Bookings List Card */}
          <div className="md:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Your Matches
              </h2>
              <Link to="/" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Book another slot
              </Link>
            </div>

            {/* Custom Tab Switcher */}
            <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mb-6 max-w-sm">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`relative flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === "upcoming" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "upcoming" && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-primary rounded-xl shadow-[var(--shadow-glow)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  Upcoming Slots
                  <span className="px-1.5 py-0.2 text-[10px] bg-white/10 rounded-full font-normal">
                    {(() => {
                      const now = Date.now();
                      return bookings.filter(b => new Date(`${b.date}T${b.time}:00`).getTime() >= now).length;
                    })()}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`relative flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === "past" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "past" && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-primary rounded-xl shadow-[var(--shadow-glow)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  Past Matches
                  <span className="px-1.5 py-0.2 text-[10px] bg-white/10 rounded-full font-normal">
                    {(() => {
                      const now = Date.now();
                      return bookings.filter(b => new Date(`${b.date}T${b.time}:00`).getTime() < now).length;
                    })()}
                  </span>
                </span>
              </button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="rounded-3xl glass p-10 text-center">
                  <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Fetching your bookings list...</p>
                </div>
              ) : bookings.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl glass p-12 text-center"
                >
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">No bookings found</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-6">You haven't booked any slots with this account yet.</p>
                  <Link to="/">
                    <Button className="rounded-full bg-primary text-primary-foreground px-6">
                      Book a Turf Slot Now
                    </Button>
                  </Link>
                </motion.div>
              ) : (() => {
                const now = Date.now();
                const upcomingBookings = bookings
                  .filter((b) => new Date(`${b.date}T${b.time}:00`).getTime() >= now)
                  .sort((a, b) => new Date(`${a.date}T${a.time}:00`).getTime() - new Date(`${b.date}T${b.time}:00`).getTime());
                const pastBookings = bookings
                  .filter((b) => new Date(`${b.date}T${b.time}:00`).getTime() < now);
                const displayedBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

                if (displayedBookings.length === 0) {
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl glass p-12 text-center"
                    >
                      <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-semibold">
                        {activeTab === "upcoming" ? "No upcoming matches" : "No past matches"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-6">
                        {activeTab === "upcoming" 
                          ? "You don't have any upcoming match slots scheduled." 
                          : "You don't have any past match history."}
                      </p>
                      {activeTab === "upcoming" && (
                        <Link to="/">
                          <Button className="rounded-full bg-primary text-primary-foreground px-6">
                            Book a Turf Slot Now
                          </Button>
                        </Link>
                      )}
                    </motion.div>
                  );
                }

                return (
                  <AnimatePresence mode="popLayout">
                    {displayedBookings.map((b) => (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-2xl glass p-5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 hover:glass-strong transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground font-semibold">{b.id}</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                              b.status === "confirmed" ? "bg-emerald-500/10 text-primary border-primary/20" :
                              b.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          <div className="text-base font-semibold text-foreground">
                            {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-primary" /> {b.time}</span>
                            <span>• {b.duration} {b.duration === 1 ? "hour" : "hours"}</span>
                            {b.team && <span>• Team: <strong className="text-foreground">{b.team}</strong></span>}
                            <span>• Payment: <strong className="text-foreground">{b.paymentMethod === "online" ? "Online" : "Pay at Court"}</strong> ({b.paymentStatus === "paid" ? <span className="text-emerald-500 font-bold">Paid</span> : <span className="text-amber-500 font-bold">Unpaid</span>})</span>
                          </div>
                          {b.notes && (
                            <div className="text-xs text-muted-foreground mt-2 italic bg-white/5 rounded p-2">
                              Request: "{b.notes}"
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-center items-stretch sm:items-end gap-2 shrink-0">
                          {isCancellable(b) ? (
                            <Button
                              onClick={() => handleCancelBooking(b.id)}
                              variant="destructive"
                              size="sm"
                              className="rounded-full bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/40 text-rose-500 text-xs py-5 px-5"
                            >
                              <XCircle className="h-4 w-4 mr-1.5" /> Cancel Slot
                            </Button>
                          ) : b.status !== "cancelled" ? (
                            <div className="text-[10px] text-muted-foreground/60 max-w-[150px] text-left sm:text-right italic">
                              Non-cancellable (deadline passed)
                            </div>
                          ) : (
                            <span className="text-xs text-rose-500 font-semibold italic">Cancelled</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                );
              })()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
