"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

type Msg = { _id: string; senderId: string; text: string; createdAt: string };

export function ConsultationChat({
  bookingId, currentUserId,
}: { bookingId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const r = await fetch(`/api/bookings/${bookingId}/messages`);
      if (r.ok) setMessages(await r.json());
    };
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [bookingId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const body = text;
    setText("");
    await fetch(`/api/bookings/${bookingId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: body }),
    });
  }

  return (
    <div className="flex flex-col h-full bg-white border border-blue-100 rounded-xl">
      <div className="px-4 py-3 border-b border-blue-100">
        <p className="font-medium text-slate-800">Chat</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                mine ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
              }`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t border-blue-100 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 h-10 px-3 rounded-lg bg-slate-50 border focus:border-blue-300 focus:outline-none text-sm"
        />
        <button className="size-10 rounded-lg bg-blue-600 text-white grid place-items-center hover:bg-blue-700">
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
