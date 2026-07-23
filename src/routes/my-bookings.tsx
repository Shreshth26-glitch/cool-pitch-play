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
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-center items-center">
        <RefreshCw className="h-8 w-8 text-iris-violet animate-spin" />
        <p className="text-xs text-ash-text mt-3">Loading account data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-16 relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-white/10 bg-transparent sticky top-0 z-30 py-1">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-white text-black flex items-center justify-center font-bold text-xs">
              F
            </div>
            <div className="text-left">
              <div className="text-xs font-bold tracking-wider leading-none text-white uppercase">frostPitch</div>
              <div className="text-[8px] uppercase tracking-[0.25em] text-ash-text font-bold mt-0.5">User Dashboard</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {token && (
              <Button 
                onClick={() => fetchUserBookings(token)} 
                variant="outline" 
                size="sm" 
                disabled={isLoading}
                className="rounded-lg border-white/10 hover:bg-white/10 text-white py-2 shadow-none"
              >
                <RefreshCw className={`h-3 w-3 mr-1.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            )}
            <Button 
              onClick={handleLogout} 
              variant="outline"
              size="sm" 
              className="rounded-lg border-white/10 text-ash-text hover:text-hot-pink hover:bg-white/10 text-xs py-2 shadow-none"
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
              className="md:col-span-1 rounded-xl bg-[#161618] border border-[#27272a] p-6 shadow-none"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded bg-[#1d1d21] text-iris-violet border border-[#27272a]/50 flex items-center justify-center font-bold text-xl mx-auto mb-3">
                  {user.name.split(" ").map(w => w[0]).join("")}
                </div>
                <h3 className="font-bold text-base text-white">{user.name}</h3>
                <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1c1c1f] border border-[#27272a] text-ash-text">
                  {user.role} Member
                </span>
              </div>

              <div className="space-y-3 text-xs text-ash-text border-t border-[#27272a] pt-4 text-left">
                <div>
                  <div className="uppercase tracking-widest text-[9px] font-bold text-ash-text/70 mb-0.5">Email</div>
                  <div className="text-white font-semibold break-all">{user.email}</div>
                </div>
                <div>
                  <div className="uppercase tracking-widest text-[9px] font-bold text-ash-text/70 mb-0.5">Phone</div>
                  <div className="text-white font-semibold">{user.phone}</div>
                </div>
                {user.role === "admin" && (
                  <div className="pt-2">
                    <Link to="/admin">
                      <Button size="sm" className="w-full rounded-lg bg-white hover:bg-white/95 text-black border-0 shadow-none font-bold text-xs py-2">
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
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-iris-violet" /> Your Matches
              </h2>
              <Link to="/" className="text-xs text-iris-violet hover:underline font-bold flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Book another slot
              </Link>
            </div>

            {/* Custom Tab Switcher */}
            <div className="flex p-1 bg-[#161618] border border-[#27272a] rounded-xl mb-6 max-w-sm shadow-none">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`relative flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                  activeTab === "upcoming" ? "text-black" : "text-ash-text hover:text-white"
                }`}
              >
                {activeTab === "upcoming" && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-white rounded-lg shadow-none"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  Upcoming Slots
                  <span className={`px-1.5 py-0.2 text-[9px] rounded font-normal font-mono ${
                    activeTab === "upcoming" ? "bg-black/10 text-black" : "bg-[#1c1c1f] text-ash-text border border-[#27272a]/50"
                  }`}>
                    {(() => {
                      const now = Date.now();
                      return bookings.filter(b => new Date(`${b.date}T${b.time}:00`).getTime() >= now).length;
                    })()}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`relative flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                  activeTab === "past" ? "text-black" : "text-ash-text hover:text-white"
                }`}
              >
                {activeTab === "past" && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-white rounded-lg shadow-none"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  Past Matches
                  <span className={`px-1.5 py-0.2 text-[9px] rounded font-normal font-mono ${
                    activeTab === "past" ? "bg-black/10 text-black" : "bg-[#1c1c1f] text-ash-text border border-[#27272a]/50"
                  }`}>
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
                <div className="rounded-xl bg-[#161618] border border-[#27272a] p-10 text-center shadow-none">
                  <RefreshCw className="h-8 w-8 text-iris-violet animate-spin mx-auto mb-3" />
                  <p className="text-xs text-ash-text">Fetching your bookings list...</p>
                </div>
              ) : bookings.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-[#161618] border border-[#27272a] p-12 text-center shadow-none"
                >
                  <CalendarIcon className="h-10 w-10 text-ash-text mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">No bookings found</h3>
                  <p className="text-xs text-ash-text mt-1 mb-6">You haven't booked any slots with this account yet.</p>
                  <Link to="/">
                    <Button className="rounded-lg bg-gradient-to-r from-iris-violet to-signal-blue border border-iris-violet/20 hover:shadow-[0_0_15px_rgba(148,138,227,0.3)] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
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
                      className="rounded-xl bg-[#161618] border border-[#27272a] p-12 text-center shadow-none"
                    >
                      <CalendarIcon className="h-10 w-10 text-ash-text mx-auto mb-3" />
                      <h3 className="text-base font-bold text-white">
                        {activeTab === "upcoming" ? "No upcoming matches" : "No past matches"}
                      </h3>
                      <p className="text-xs text-ash-text mt-1 mb-6">
                        {activeTab === "upcoming" 
                          ? "You don't have any upcoming match slots scheduled." 
                          : "You don't have any past match history."}
                      </p>
                      {activeTab === "upcoming" && (
                        <Link to="/">
                          <Button className="rounded-lg bg-gradient-to-r from-iris-violet to-signal-blue border border-iris-violet/20 hover:shadow-[0_0_15px_rgba(148,138,227,0.3)] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
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
                        className="rounded-xl bg-[#161618] border border-[#27272a] p-5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 hover:border-iris-violet/40 transition-all duration-300 shadow-none"
                      >
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-ash-text font-bold">{b.id}</span>
                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                              b.status === "confirmed" ? "bg-mint-green/10 text-mint-green border-mint-green/30" :
                              b.status === "pending" ? "bg-canary-yellow/10 text-canary-yellow border-canary-yellow/30" :
                              "bg-hot-pink/10 text-hot-pink border-hot-pink/30"
                            }`}>
                              {b.status}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white mt-1">
                            {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div className="text-xs text-ash-text flex flex-wrap gap-x-4 gap-y-1 font-medium mt-0.5">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-iris-violet" /> {b.time}</span>
                            <span>• {b.duration} {b.duration === 1 ? "hour" : "hours"}</span>
                            {b.team && <span>• Team: <strong className="text-white">{b.team}</strong></span>}
                            <span>• Payment: <strong className="text-white">{b.paymentMethod === "online" ? "Online" : "Pay at Court"}</strong> ({b.paymentStatus === "paid" ? <span className="text-mint-green bg-mint-green/10 border border-mint-green/20 px-1.5 py-0.5 rounded font-bold">Paid</span> : <span className="text-canary-yellow bg-canary-yellow/10 border border-canary-yellow/20 px-1.5 py-0.5 rounded font-bold">Unpaid</span>})</span>
                          </div>
                          {b.notes && (
                            <div className="text-xs text-ash-text mt-2 italic bg-[#1c1c1f] border border-[#27272a]/50 rounded p-2">
                              Request: "{b.notes}"
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-center items-stretch sm:items-end gap-2 shrink-0">
                          {isCancellable(b) ? (
                            <Button
                              onClick={() => handleCancelBooking(b.id)}
                              variant="outline"
                              size="sm"
                              className="rounded-lg bg-[#121214] border border-[#27272a] text-ash-text hover:text-hot-pink hover:bg-hot-pink/5 hover:border-hot-pink/30 text-xs py-4 px-4 shadow-none font-semibold transition duration-200"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1.5" /> Cancel Slot
                            </Button>
                          ) : b.status !== "cancelled" ? (
                            <div className="text-[10px] text-ash-text max-w-[150px] text-left sm:text-right italic">
                              Non-cancellable (deadline passed)
                            </div>
                          ) : (
                            <span className="text-xs text-hot-pink font-bold italic uppercase tracking-wider bg-hot-pink/10 border border-hot-pink/25 rounded px-2 py-0.5 font-sans">Cancelled</span>
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
