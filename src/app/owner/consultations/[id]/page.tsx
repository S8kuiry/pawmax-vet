"use client";
import { useEffect, useRef, useState, use } from "react";
import { Send } from "lucide-react";

export default function ConsultRoom({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const [roomUrl, setRoomUrl] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string; at: string }[]>([]);
  const [text, setText] = useState("");
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}/room`, { method: "POST" })
      .then(r => r.json()).then(d => setRoomUrl(d.url));
    fetch(`/api/bookings/${bookingId}/messages`).then(r => r.json()).then(d => setMessages(d.messages || []));
  }, [bookingId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch(`/api/bookings/${bookingId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const m = await res.json();
    setMessages(prev => [...prev, m]);
    setText("");
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <div className="lg:col-span-2 bg-slate-900 rounded-2xl overflow-hidden">
        {roomUrl ? (
          <iframe ref={frameRef} src={roomUrl} allow="camera; microphone; fullscreen" className="w-full h-full" />
        ) : (
          <div className="h-full grid place-items-center text-white/60">Connecting to video…</div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl flex flex-col">
        <header className="px-4 py-3 border-b font-semibold text-blue-700">Chat</header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`max-w-[80%] ${m.from === "owner" ? "ml-auto" : ""}`}>
              <div className={`px-3 py-2 rounded-lg text-sm ${m.from === "owner" ? "bg-blue-600 text-white" : "bg-slate-100"}`}>{m.text}</div>
              <p className="text-xs text-slate-400 mt-1">{new Date(m.at).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="p-3 border-t flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none" />
          <button className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700"><Send className="size-4" /></button>
        </form>
      </div>
    </div>
  );
}
