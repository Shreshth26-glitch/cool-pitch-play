import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { getAllBookings, updateBookingStatus, getAvailableSlots, updateAvailableSlots, updateBookingPaymentStatus } from "../lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Clock, Users, DollarSign, Search, Lock, LogOut, Check, X, 
  RefreshCw, Phone, Mail, MessageCircle, ArrowLeft, Calendar as CalendarIcon, Snowflake, CreditCard,
  CalendarCheck
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import type { Booking } from "../lib/api-client";
import { useAuth } from "../hooks/use-auth";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { token, login, logout, isAdmin, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow" | "future">("all");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Available slots settings state
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState("");
  const [isSavingSlots, setIsSavingSlots] = useState(false);

  // View mode and selected date for calendar view
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());

  const fetchBookings = async (authToken: string) => {
    setIsLoading(true);
    try {
      const data = await getAllBookings(authToken);
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const data = await getAvailableSlots();
      setAvailableSlots(data.sort());
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load booking slots settings.");
    }
  };

  // Fetch bookings and slots automatically when token and isAdmin are set
  useEffect(() => {
    if (token && isAdmin) {
      fetchBookings(token);
      fetchSlots();
    }
  }, [token, isAdmin]);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlot = newSlot.trim();
    if (!cleanSlot) return;

    // Validate HH:MM format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(cleanSlot)) {
      toast.error("Invalid slot time. Must be in HH:MM format (e.g. 09:30 or 15:00)");
      return;
    }

    // Ensure slot has leading zero if hour is single digit, to keep sorting clean
    let formattedSlot = cleanSlot;
    const parts = cleanSlot.split(":");
    if (parts[0].length === 1) {
      formattedSlot = `0${parts[0]}:${parts[1]}`;
    }

    if (availableSlots.includes(formattedSlot)) {
      toast.error("This slot time is already in the list!");
      return;
    }

    setAvailableSlots(prev => [...prev, formattedSlot].sort());
    setNewSlot("");
    toast.success(`Added ${formattedSlot} to list. Remember to click Save Changes.`);
  };

  const handleDeleteSlot = (slotToDelete: string) => {
    setAvailableSlots(prev => prev.filter(s => s !== slotToDelete));
    toast.success(`Removed ${slotToDelete} from list. Remember to click Save Changes.`);
  };

  const handleSaveSlots = async () => {
    if (!token) return;
    setIsSavingSlots(true);
    try {
      await updateAvailableSlots(availableSlots, token);
      toast.success("Successfully updated available booking slots!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update available booking slots");
    } finally {
      setIsSavingSlots(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Authorized successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to log in. Check admin credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setBookings([]);
    toast.success("Logged out");
  };

  const handleStatusChange = async (id: string, newStatus: "confirmed" | "cancelled" | "pending") => {
    if (!token) return;
    const originalBookings = [...bookings];
    
    // Optimistic UI update
    setBookings(prev => 
      prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
    );

    try {
      await updateBookingStatus(id, newStatus, token);
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update booking status");
      // Rollback
      setBookings(originalBookings);
    }
  };

  const handlePaymentStatusChange = async (id: string, newPaymentStatus: "unpaid" | "paid") => {
    if (!token) return;
    const originalBookings = [...bookings];

    // Optimistic UI update
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, paymentStatus: newPaymentStatus } : b)
    );

    try {
      await updateBookingPaymentStatus(id, newPaymentStatus, token);
      toast.success(`Payment status updated to ${newPaymentStatus}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update payment status");
      // Rollback
      setBookings(originalBookings);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const active = bookings.filter(b => b.status !== "cancelled");
    const totalCount = active.length;
    const totalHours = active.reduce((acc, b) => acc + b.duration, 0);
    const revenue = totalHours * 800;
    
    const uniquePlayers = new Set(active.map(b => b.phone)).size;

    // Today's slot utilization
    const todayStr = new Date().toISOString().split("T")[0];
    const todayBookings = active.filter(b => b.date === todayStr);
    const todayHours = todayBookings.reduce((acc, b) => acc + b.duration, 0);
    const utilizationRate = Math.min(Math.round((todayHours / 18) * 100), 100); // 18 hours max play time (6am - 2am is 20h, let's say 18h slot capacity)

    return {
      totalCount,
      revenue,
      uniquePlayers,
      utilizationRate
    };
  }, [bookings]);

  // Filtering bookings
  const filteredBookings = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    return bookings.filter(b => {
      // Search term match
      const matchesSearch = 
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.phone.includes(search) ||
        (b.team && b.team.toLowerCase().includes(search.toLowerCase())) ||
        b.id.toLowerCase().includes(search.toLowerCase());

      // Status filter match
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;

      // Date filter match
      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate = b.date === todayStr;
      } else if (dateFilter === "tomorrow") {
        matchesDate = b.date === tomorrowStr;
      } else if (dateFilter === "future") {
        matchesDate = b.date >= todayStr;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, search, statusFilter, dateFilter]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Background Beams */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[50vh] w-[500px] blur-3xl opacity-20" style={{ background: "radial-gradient(circle, oklch(0.80 0.14 78), transparent 70%)" }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md rounded-3xl glass-strong p-8 relative z-10"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition mb-4">
              <ArrowLeft className="h-3 w-3" /> Back to Website
            </Link>
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/20 grid place-items-center mb-3 glow-emerald">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-display">Don Bosco Turf Admin</h1>
            {isAuthenticated && !isAdmin ? (
              <p className="text-sm text-rose-500 mt-1 font-semibold">Access Denied: Admin permissions required.</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Log in with your administrator credentials.</p>
            )}
          </div>

          {isAuthenticated && !isAdmin ? (
            <div className="space-y-4">
              <Button onClick={logout} className="w-full rounded-full bg-primary text-primary-foreground py-6 font-semibold shadow-[var(--shadow-glow)]">
                Sign out of current account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Admin Email or Phone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-border py-6 text-center"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-border py-6 text-center"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full rounded-full bg-primary text-primary-foreground py-6 font-semibold shadow-[var(--shadow-glow)] hover:opacity-90">
                {isLoading ? "Authenticating..." : "Unlock Dashboard"}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 13l4 4L20 7" />
            </svg>
            <div>
              <div className="text-xs font-bold tracking-wider leading-none">DON BOSCO</div>
              <div className="text-[8px] uppercase tracking-[0.25em] text-muted-foreground">Admin Portal</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => token && fetchBookings(token)} 
              variant="outline" 
              size="sm" 
              disabled={isLoading}
              className="rounded-full border-border glass text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
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

      <main className="mx-auto max-w-7xl px-4 md:px-6 mt-8">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Turf Bookings Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage match schedules, client contacts, and pitch operations.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border p-1 bg-white/5 text-xs self-stretch md:self-auto justify-center">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 font-medium ${
                viewMode === "list" ? "bg-primary text-primary-foreground font-semibold shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 font-medium ${
                viewMode === "calendar" ? "bg-primary text-primary-foreground font-semibold shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Bookings", val: stats.totalCount, sub: "Excluding cancelled slots", icon: CalendarIcon },
            { label: "Est. Revenue", val: `₹${stats.revenue}`, sub: "Active hours * ₹800", icon: DollarSign },
            { label: "Unique Players", val: stats.uniquePlayers, sub: "Loyal client base", icon: Users },
            { label: "Today's Utilization", val: `${stats.utilizationRate}%`, sub: "Percentage of slots filled", icon: Clock },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl glass p-5 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                  <div className="text-2xl md:text-3xl font-bold mt-2 font-display">{stat.val}</div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center text-primary">
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground mt-3">{stat.sub}</div>
            </div>
          ))}
        </div>

        {viewMode === "list" ? (
          <>
            {/* Filters and Search */}
            <div className="rounded-3xl glass p-5 mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search player name, phone, team or booking ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/5 border-border rounded-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Date filter */}
                <div className="flex rounded-full border border-border p-1 bg-white/5 text-xs">
                  {(["all", "today", "tomorrow", "future"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`px-3 py-1.5 rounded-full capitalize transition ${
                        dateFilter === filter ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Status filter */}
                <div className="flex rounded-full border border-border p-1 bg-white/5 text-xs">
                  {(["all", "confirmed", "pending", "cancelled"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1.5 rounded-full capitalize transition ${
                        statusFilter === filter ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table / List */}
            <div className="rounded-3xl glass overflow-hidden border border-border">
              {isLoading ? (
                <div className="text-center py-20">
                  <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Loading bookings data...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-20">
                  <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">No bookings found</h3>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-white/5 text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="px-6 py-4 font-semibold">ID</th>
                        <th className="px-6 py-4 font-semibold">Player / Team</th>
                        <th className="px-6 py-4 font-semibold">Schedule</th>
                        <th className="px-6 py-4 font-semibold">Duration</th>
                        <th className="px-6 py-4 font-semibold">Contact</th>
                        <th className="px-6 py-4 font-semibold text-center">Payment</th>
                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4 font-mono text-xs font-semibold text-muted-foreground">
                            {b.id}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-foreground">{b.name}</div>
                            {b.team ? (
                              <div className="text-xs text-primary font-medium mt-0.5">{b.team}</div>
                            ) : (
                              <div className="text-xs text-muted-foreground italic mt-0.5">Individual</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">
                              {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3 text-primary" /> {b.time}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {b.duration} {b.duration === 1 ? "hour" : "hours"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <a 
                                href={`tel:${b.phone}`} 
                                title="Call Player"
                                className="w-7 h-7 rounded-lg bg-white/5 border border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/40 transition"
                              >
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                              {b.email && (
                                <a 
                                  href={`mailto:${b.email}`} 
                                  title={b.email}
                                  className="w-7 h-7 rounded-lg bg-white/5 border border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/40 transition"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                </a>
                              )}
                              <a 
                                href={`https://wa.me/${b.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp Chat"
                                className="w-7 h-7 rounded-lg bg-white/5 border border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/40 transition"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                              <span className="text-xs font-mono text-muted-foreground ml-1">{b.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                                {b.paymentMethod === "online" ? "Online" : "At Court"}
                              </span>
                              <button
                                onClick={() => handlePaymentStatusChange(b.id, b.paymentStatus === "paid" ? "unpaid" : "paid")}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                                  b.paymentStatus === "paid"
                                    ? "bg-emerald-500/10 text-primary border-primary/30 hover:bg-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                                }`}
                              >
                                {b.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                b.status === "confirmed" ? "bg-emerald-500/10 text-primary border-primary/30" :
                                b.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/30" :
                                "bg-rose-500/10 text-rose-500 border-rose-500/30"
                              }`}>
                                {b.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {b.status !== "confirmed" && (
                                <Button
                                  onClick={() => handleStatusChange(b.id, "confirmed")}
                                  size="sm"
                                  title="Confirm Booking"
                                  className="w-8 h-8 rounded-full bg-emerald-500/20 text-primary hover:bg-emerald-500/40 p-0 border border-primary/30"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {b.status !== "cancelled" && (
                                <Button
                                  onClick={() => handleStatusChange(b.id, "cancelled")}
                                  size="sm"
                                  variant="destructive"
                                  title="Cancel Booking"
                                  className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-500 hover:bg-rose-500/40 p-0 border border-rose-500/30"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Calendar Scheduler View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
            {/* Left Column: Calendar selection */}
            <div className="lg:col-span-4 rounded-3xl glass p-6 flex flex-col items-center">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 self-start">
                <CalendarIcon className="h-5 w-5 text-primary" /> Select Date
              </h3>
              <Calendar
                mode="single"
                selected={selectedCalendarDate}
                onSelect={setSelectedCalendarDate}
                className="rounded-2xl border border-border bg-card/40 p-4"
                modifiers={{
                  hasBooking: (date) => {
                    if (!date) return false;
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;
                    return bookings.some(b => b.date === dateStr && b.status !== "cancelled");
                  }
                }}
                modifiersClassNames={{
                  hasBooking: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary"
                }}
              />
              <div className="text-[10px] text-muted-foreground mt-4 self-start flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" /> Dates with active matches
              </div>
            </div>

            {/* Right Column: Schedule slots */}
            <div className="lg:col-span-8 rounded-3xl glass p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 mb-6 gap-2">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-primary" /> Day Schedule
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedCalendarDate ? selectedCalendarDate.toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : "No date selected"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-primary/30" /> Confirmed
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/30" /> Pending
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-full border border-dashed border-border" /> Free Slot
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {availableSlots.map(slot => {
                  const getLocalYYYYMMDD = (date: Date | undefined) => {
                    if (!date) return "";
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                  };
                  const formattedSelectedDate = getLocalYYYYMMDD(selectedCalendarDate);
                  const booking = bookings.find(b => b.date === formattedSelectedDate && b.time === slot && b.status !== "cancelled");

                  return (
                    <div key={slot} className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                      {/* Time Slot */}
                      <div className="md:col-span-2 font-display font-bold text-base text-primary flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                        {slot}
                      </div>

                      {/* Card Content */}
                      <div className="md:col-span-10">
                        {booking ? (
                          <div className={`rounded-2xl border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                            booking.status === "confirmed" ? "bg-emerald-500/5 border-primary/20 hover:border-primary/40" :
                            "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                          }`}>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-foreground">{booking.name}</span>
                                {booking.team && (
                                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{booking.team}</span>
                                )}
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                                  booking.status === "confirmed" ? "bg-emerald-500/10 text-primary border-primary/20" :
                                  "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                }`}>{booking.status}</span>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
                                  booking.paymentStatus === "paid" ? "bg-emerald-500/10 text-primary border-primary/20" :
                                  "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                }`}>{booking.paymentMethod === "online" ? "Online" : "At Court"}: {booking.paymentStatus}</span>
                              </div>
                              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>Duration: <strong>{booking.duration} {booking.duration === 1 ? "hour" : "hours"}</strong></span>
                                <span>Phone: <strong>{booking.phone}</strong></span>
                                {booking.email && <span>Email: <strong>{booking.email}</strong></span>}
                              </div>
                              {booking.notes && (
                                <div className="text-xs text-muted-foreground mt-1.5 italic bg-black/15 rounded-lg p-2 max-w-xl">
                                  "{booking.notes}"
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 border-border/40 pt-3 md:pt-0 shrink-0">
                              <div className="flex items-center gap-1">
                                <a 
                                  href={`tel:${booking.phone}`} 
                                  title="Call Player"
                                  className="w-7 h-7 rounded-lg bg-white/5 border border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/40 transition"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                                <a 
                                  href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="WhatsApp Chat"
                                  className="w-7 h-7 rounded-lg bg-white/5 border border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/40 transition"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </a>
                              </div>
                              <div className="h-5 w-[1px] bg-border/60 mx-1" />
                              <Button
                                onClick={() => handlePaymentStatusChange(booking.id, booking.paymentStatus === "paid" ? "unpaid" : "paid")}
                                size="sm"
                                className={`h-8 rounded-full border px-3 text-xs font-semibold flex items-center gap-1.5 ${
                                  booking.paymentStatus === "paid"
                                    ? "bg-emerald-500/20 text-primary border-primary/30 hover:bg-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-500 border-amber-500/30 hover:bg-amber-500/30"
                                }`}
                              >
                                <CreditCard className="h-3.5 w-3.5 shrink-0" />
                                Mark {booking.paymentStatus === "paid" ? "Unpaid" : "Paid"}
                              </Button>
                              <div className="h-5 w-[1px] bg-border/60 mx-1" />
                              {booking.status !== "confirmed" && (
                                <Button
                                  onClick={() => handleStatusChange(booking.id, "confirmed")}
                                  size="sm"
                                  className="h-8 rounded-full bg-emerald-500/20 text-primary hover:bg-emerald-500/40 px-3 border border-primary/30 text-xs font-semibold"
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" /> Confirm
                                </Button>
                              )}
                              <Button
                                onClick={() => handleStatusChange(booking.id, "cancelled")}
                                size="sm"
                                variant="destructive"
                                className="h-8 rounded-full bg-rose-500/20 text-rose-500 hover:bg-rose-500/40 px-3 border border-rose-500/30 text-xs font-semibold"
                              >
                                <X className="h-3.5 w-3.5 mr-1" /> Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-border/50 bg-transparent p-4 text-sm text-muted-foreground flex justify-between items-center transition-all hover:bg-white/[0.01]">
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
                              Free slot available
                            </div>
                            <span className="text-[10px] text-muted-foreground/50 italic hidden sm:inline">No Booking</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {availableSlots.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-border rounded-3xl text-muted-foreground text-sm">
                    No operating slots configured. Add daily slots in the panel below.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Special requests, manage slots, and capacities */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="rounded-3xl glass p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Special Requests & Notes
              </h3>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
                {filteredBookings.filter(b => b.notes).map(b => (
                  <div key={b.id} className="border-b border-border pb-3 last:border-0">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground">{b.name} ({b.id})</span>
                      <span className="text-muted-foreground">{b.date} · {b.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 italic">"{b.notes}"</p>
                  </div>
                ))}
                {filteredBookings.filter(b => b.notes).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No special requests for the filtered slots.</p>
                )}
              </div>
            </div>
          </div>

          {/* Manage Booking Slots Panel */}
          <div className="rounded-3xl glass p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Manage Booking Slots
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Add, delete, or configure the daily operating slot times. Remember to save changes.
              </p>

              {/* Time Slots List */}
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1 mb-4">
                {availableSlots.map(slot => (
                  <div key={slot} className="inline-flex items-center gap-1 bg-white/5 border border-border rounded-full px-2.5 py-1 text-xs text-foreground">
                    <span>{slot}</span>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteSlot(slot)} 
                      className="text-muted-foreground hover:text-rose-500 transition ml-1"
                      title="Remove Slot"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {availableSlots.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No time slots configured.</p>
                )}
              </div>

              {/* Add New Slot Form */}
              <form onSubmit={handleAddSlot} className="flex gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="HH:MM (e.g. 15:30)"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="bg-white/5 border-border text-xs rounded-lg py-1.5 h-9 flex-1"
                />
                <Button type="submit" size="sm" className="h-9 px-3 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/35">
                  Add
                </Button>
              </form>
            </div>

            {/* Save Buttons */}
            <div className="pt-4 border-t border-border mt-auto">
              <Button 
                onClick={handleSaveSlots} 
                disabled={isSavingSlots} 
                className="w-full rounded-xl bg-primary text-primary-foreground py-2 font-semibold shadow-sm hover:opacity-90 transition text-sm h-10"
              >
                {isSavingSlots ? "Saving Slots..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl glass p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" /> Turf Capacity Guide
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Operating Slots run daily from <strong>6:00 AM</strong> to <strong>2:00 AM</strong> (next day). Peak hours typically run after 6:00 PM when floodlights are active.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mt-4">
                <li>• <strong>Mist cooling:</strong> Operates at maximum capacity between 11 AM - 5 PM.</li>
                <li>• <strong>LED Floodlights:</strong> Auto-activate at sunset (approx. 6:30 PM).</li>
                <li>• <strong>Equipment Rental:</strong> Managed by staff on-site.</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-border mt-4 text-xs text-muted-foreground text-center">
              Don Bosco Turf Management System · Bhilwara
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
