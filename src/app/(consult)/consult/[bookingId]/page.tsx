"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { DailyProvider, useDaily, useParticipantIds, DailyVideo } from "@daily-co/daily-react";
import { Send, Video, MessageSquare } from "lucide-react";

function Stage() {
  const daily = useDaily();
  const ids = useParticipantIds();
  useEffect(() => () => { daily?.leave(); }, [daily]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-brand-950 rounded-xl">
      {ids.map(id => (
        <div key={id} className="aspect-video bg-black rounded-lg overflow-hidden">
          <DailyVideo sessionId={id} type="video" automirror />
        </div>
      ))}
      {!ids.length && <div className="text-brand-100 p-10 text-center col-span-full">Waiting for participants…</div>}
    </div>
  );
}

function Chat({ bookingId }: { bookingId: string }) {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const j = await fetch(`/api/bookings/${bookingId}/messages`).then(r => r.json());
    setMsgs(j.messages || []);
  };
  useEffect(() => { load(); const t = setInterval(load, 3000); return () => clearInterval(t); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!text.trim()) return;
    await fetch(`/api/bookings/${bookingId}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setText(""); load();
  };

  return (
    <div className="bg-white border border-brand-100 rounded-2xl shadow-card flex flex-col h-[480px]">
      <div className="px-4 py-3 border-b border-brand-100 flex items-center gap-2 text-brand-900 font-medium">
        <MessageSquare className="size-4" /> Chat
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {msgs.map((m: any) => (
          <div key={m._id} className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.senderRole === "vet" ? "bg-brand-50 text-brand-900" : "ml-auto bg-brand-600 text-white"}`}>
            {m.text}
            <div className="text-[10px] opacity-70 mt-1">{new Date(m.at).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-brand-100 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="flex-1 border border-brand-200 rounded-lg px-3 py-2 text-sm" />
        <button onClick={send} className="bg-brand-600 hover:bg-brand-700 text-white p-2 rounded-lg">
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function ConsultRoom() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [room, setRoom] = useState<any>(null);
  const [token, setToken] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/bookings/${bookingId}/room`, { method: "POST" });
      const j = await r.json();
      setRoom(j.room); setToken(j.token);
    })();
  }, [bookingId]);

  if (!room) return <div className="p-8 text-slate-500">Preparing room…</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center gap-2 mb-4 text-brand-900">
        <Video className="size-5" />
        <h1 className="text-xl font-semibold">Consultation</h1>
        <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">{room.mode}</span>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {room.mode === "video" && room.dailyRoomUrl ? (
            <DailyProvider url={room.dailyRoomUrl} token={token} startVideoOff={false} startAudioOff={false}>
              <Stage />
            </DailyProvider>
          ) : (
            <div className="bg-white border border-brand-100 rounded-2xl p-10 text-center text-slate-500">
              Chat-only consultation. Use the panel on the right.
            </div>
          )}
        </div>
        <Chat bookingId={bookingId} />
      </div>
    </div>
  );
}
