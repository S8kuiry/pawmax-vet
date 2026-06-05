"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Plus, AlertCircle, CheckCircle2, Trash2, CalendarDays, User2, ArrowUpRight, Save, Layers, Sparkles } from "lucide-react";

interface LocalQueueSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export default function VetUnifiedSchedulePage() {
  // Database Timelines
  const [dbSlots, setDbSlots] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Workspace Inputs
  const [selectedDate, setSelectedDate] = useState("");
  const [customStart, setCustomStart] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(30);
  
  // Staging Matrix Area
  const [localQueue, setLocalQueue] = useState<LocalQueueSlot[]>([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  async function fetchSchedule() {
    try {
      const res = await fetch("/api/vet/slots");
      if (!res.ok) throw new Error("Database offline");
      const data = await res.json();
      setDbSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error reading schedule:", err);
      setDbSlots([]); 
    } finally {
      setFetching(false);
    }
  }

  function computeEndTime(timeStr: string, minutesToAdd: number): string {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + minutesToAdd);
    return date.toTimeString().slice(0, 5);
  }

  function handleAddToLocalQueue(e: React.FormEvent) {
    e.preventDefault();
    if (!customStart) return;

    const calculatedEndTime = computeEndTime(customStart, selectedDuration);

    const newQueueItem: LocalQueueSlot = {
      id: Math.random().toString(36).substring(2, 9),
      startTime: customStart,
      endTime: calculatedEndTime,
      duration: selectedDuration
    };

    setLocalQueue((prev) => 
      [...prev, newQueueItem].sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
    
    setCustomStart("");
    setMessage({ text: "", type: "" });
  }

  function handleRemoveFromQueue(id: string) {
    setLocalQueue((prev) => prev.filter((item) => item.id !== id));
  }

  async function handlePublishBatch() {
    if (localQueue.length === 0 || !selectedDate) return;
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/vet/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          slots: localQueue
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch generation fault");

      setMessage({ text: `Successfully synchronized ${localQueue.length} operational blocks to the calendar.`, type: "success" });
      setLocalQueue([]); 
      fetchSchedule();   
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const groupedSchedule: Record<string, any[]> = {};
  dbSlots.forEach((slot: any) => {
    const dateKey = new Date(slot.startTime).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric"
    });
    if (!groupedSchedule[dateKey]) groupedSchedule[dateKey] = [];
    groupedSchedule[dateKey].push(slot);
  });

  return (
    <div className="min-h-screen bg-[#FFFFF] text-slate-200 max-w-[1500px] mx-auto py-8 px-6 lg:px-10 space-y-8 antialiased">
      
      {/* Premium Dashboard Top Bar */}
      <div className="pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 block mb-1">Clinical Terminal</span>
          <h1 className="text-xl font-bold tracking-tight text-blue-500">Roster Operations</h1>
          <p className="text-xs text-slate-700 mt-1 max-w-xl leading-relaxed">
            Construct complex daily operational timelines and track confirmed client checkups with automated interval matrices.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#111625] border border-slate-800 rounded-lg px-4 py-2 text-[11px] shadow-sm">
          <CalendarDays className="size-3.5 text-slate-500" />
          <div className="space-y-0.5">
            <p className="font-medium text-slate-300">{dbSlots.filter(s => s.status === 'booked').length} Booked Shifts</p>
            <p className="text-slate-500 font-medium">{dbSlots.filter(s => s.status === 'available').length} Openings Live</p>
          </div>
        </div>
      </div>

      {/* Modern Status Notifications */}
      {message.text && (
        <div className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs font-medium animate-in fade-in duration-150 ${
          message.type === "success" ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/60" : "bg-rose-950/40 text-rose-400 border-rose-800/60"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0" /> : <AlertCircle className="size-4 text-rose-500 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Workspace Grid Control Splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ==================== LEFT CONFIGURATION COLUMN (DARK BLOCKS) ==================== */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Module 1: Targeted Date Window */}
          <div className="bg-[#111726] border border-slate-800/90 rounded-xl p-4 shadow-xl space-y-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              1. Base Target Date Configuration
            </label>
            <div className="relative">
              <Calendar className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input 
                type="date" 
                required 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#171f32] border border-slate-700/60 rounded-lg text-xs font-medium text-white outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition" 
              />
            </div>
          </div>

          {/* Module 2: Time Interval Matrix Planner */}
          <div className={`bg-[#111726] border border-slate-800/90 rounded-xl p-4 shadow-xl space-y-4 transition-all duration-200 ${!selectedDate ? "opacity-20 pointer-events-none select-none filter grayscale" : ""}`}>
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-blue-400" /> 2. Core Operational Metrics
            </h3>
            
            <form onSubmit={handleAddToLocalQueue} className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">Session Start Sequence</label>
                <div className="relative">
                  <Clock className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="time" 
                    required 
                    value={customStart} 
                    onChange={(e) => setCustomStart(e.target.value)} 
                    className="w-full pl-9 pr-3 py-1.5 bg-[#171f32] border border-slate-700/60 rounded-lg text-xs text-white outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition [color-scheme:dark]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">Interval Duration Matrix</label>
                <div className="grid grid-cols-5 gap-1">
                  {[15, 30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSelectedDuration(mins)}
                      className={`py-1 text-[11px] font-semibold rounded transition text-center ${
                        selectedDuration === mins
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-[#171f32] text-slate-400 hover:bg-[#1e2942] hover:text-slate-200"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-md">
                <Plus className="size-3.5" /> Append Shift Line Block
              </button>
            </form>
          </div>

          {/* Module 3: Active Live Queue Deck */}
          {localQueue.length > 0 && (
            <div className="bg-[#111726]/60 border border-blue-900/40 rounded-xl p-4 space-y-3 animate-in slide-in-from-bottom-1 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="size-3.5" /> Local Staging Pipeline ({localQueue.length})
                </h4>
              </div>

              <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                {localQueue.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between bg-[#161e30] border border-slate-800 p-2 rounded-lg text-xs font-medium text-slate-300">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black w-4 h-4 rounded bg-[#1e2942] text-blue-400 border border-slate-700/60 flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{item.startTime}</span>
                        <span className="text-slate-600">→</span>
                        <span className="text-slate-400">{item.endTime}</span>
                        <span className="text-[9px] bg-blue-950/60 text-blue-400 px-1 py-0.5 rounded border border-blue-900/40">({item.duration}m)</span>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFromQueue(item.id)} className="text-slate-500 hover:text-rose-400 p-1 transition">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={handlePublishBatch}
                disabled={loading}
                className="w-full bg-[#1e2942] hover:bg-[#253454] border border-slate-700 text-white text-[11px] font-medium py-1.5 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Save className="size-3.5 text-blue-400" /> {loading ? "Syncing Clusters..." : `Publish Current Matrix (${localQueue.length})`}
              </button>
            </div>
          )}

        </div>

        {/* ==================== RIGHT LIVE MONITOR TIMELINE COLUMN ==================== */}
        <div className="lg:col-span-7 space-y-4">
          {fetching ? (
            <div className="h-48 border border-slate-800 rounded-xl bg-[#111726]/40 flex items-center justify-center text-xs text-slate-500 font-medium tracking-wide">
              Polling live network consultation grids...
            </div>
          ) : dbSlots.length === 0 ? (
            <div className="h-48 border border-dashed border-slate-800 rounded-xl bg-transparent flex flex-col items-center justify-center text-center p-6">
              <Calendar className="size-5 text-slate-700 mb-1.5" />
              <p className="text-xs text-slate-400 font-medium">No live schedules map recorded.</p>
              <p className="text-[11px] text-slate-600 max-w-xs mt-0.5">Select a target timeline configuration string to inject live production vectors.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSchedule).map(([dateLabel, daySlots]) => (
                <div key={dateLabel} className="bg-[#111726] border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                  
                  {/* Local Header Date Wrapper */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h2 className="text-xs font-semibold text-white tracking-tight">{dateLabel}</h2>
                    <span className="text-[9px] font-bold text-blue-400 bg-blue-950/60 border border-blue-900/40 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {daySlots.length} Blocks Registered
                    </span>
                  </div>

                  {/* Sequential Blocks Stack Rendering */}
                  <div className="space-y-1.5">
                    {daySlots.map((slot: any, idx: number) => {
                      const isBooked = slot.status === "booked";
                      const formatTime = (isoStr: string) => new Date(isoStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
                      const booking = slot.bookingId;
                      const patientName =
                        booking?.patientName ||
                        booking?.ownerId?.name ||
                        booking?.ownerName;

                      return (
                        <div 
                          key={String(slot._id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                            isBooked ? "bg-[#16223f] border-blue-900/60" : "bg-[#141a29]/80 border-slate-800/60 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Explicit Ordered Identifier Label layout requested */}
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide shrink-0 ${
                              isBooked ? "bg-blue-600 text-white" : "bg-[#1c2438] text-slate-400"
                            }`}>
                              Slot {idx + 1}
                            </span>

                            <div className="text-xs font-medium text-slate-200 flex items-center gap-1 shrink-0">
                              <span className="text-white">{formatTime(slot.startTime)}</span>
                              <span className="text-slate-600 text-[10px] mx-0.5">to</span>
                              <span className="text-slate-400">{formatTime(slot.endTime)}</span>
                            </div>

                            <div className="min-w-0 truncate hidden sm:block">
                              {isBooked ? (
                                <p className="text-xs font-medium text-blue-300 flex items-center gap-1.5">
                                  <User2 className="size-3 text-blue-400 shrink-0" />
                                  <span className="truncate">{patientName || "Client Booking"}</span>
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-600 font-medium italic">Idle Roster Pipeline</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                              isBooked ? "bg-blue-950 text-blue-400 border-blue-900" : "bg-slate-900 text-slate-500 border-slate-800"
                            }`}>
                              {isBooked ? "Booked" : "Vacant"}
                            </span>
                            {isBooked && (
                              <button className="p-1 border border-slate-700 rounded bg-[#171f32] text-slate-400 hover:text-white transition">
                                <ArrowUpRight className="size-3" />
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}