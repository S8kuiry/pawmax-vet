"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

type Message = {
  _id: string;
  senderId: string;
  senderRole: "vet" | "owner" | "system";
  text: string;
  createdAt: string;
};

type Props = {
  bookingId: string;
  currentUserId: string;
  senderRole: "vet" | "owner";
  disabled?: boolean;
};

export default function ConsultChat({
  bookingId,
  currentUserId,
  senderRole,
  disabled,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const apiUrl = `/api/consult/${bookingId}/messages`;

  const mergeMessages = useCallback((incoming: Message[]) => {
    setMessages((prev) => {
      const map = new Map<string, Message>();
      for (const m of prev) {
        if (!m._id.startsWith("temp-")) map.set(m._id, m);
      }
      for (const m of incoming) map.set(m._id, m);
      return [...map.values()].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (document.visibilityState === "hidden") return;
      try {
        const r = await fetch(apiUrl, { cache: "no-store" });
        if (!r.ok) {
          if (alive && r.status === 404) setError("Chat unavailable for this booking.");
          if (alive && r.status === 401) setError("Please sign in again.");
          return;
        }
        const j = await r.json();
        if (alive) {
          mergeMessages(j.messages ?? []);
          setError(null);
        }
      } catch {
        if (alive) setError("Could not load messages.");
      }
    }

    load();
    const id = setInterval(load, 2000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [apiUrl, mergeMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending || disabled || error) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      _id: tempId,
      senderId: currentUserId,
      senderRole,
      text: body,
      createdAt: new Date().toISOString(),
    };

    setMessages((m) => [...m, optimistic]);
    setText("");
    setSending(true);

    try {
      const r = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body }),
      });
      if (r.ok) {
        const j = await r.json();
        setMessages((m) =>
          m
            .filter((x) => x._id !== tempId)
            .concat(j.message)
            .sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            ),
        );
        setError(null);
      } else {
        setMessages((m) => m.filter((x) => x._id !== tempId));
        setText(body);
        setError("Failed to send message.");
      }
    } catch {
      setMessages((m) => m.filter((x) => x._id !== tempId));
      setText(body);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 lg:bg-white border-0 lg:border border-slate-200 rounded-none lg:rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 lg:border-slate-200">
        <h3 className="font-semibold text-blue-400 lg:text-blue-600">Chat</h3>
        {error && <p className="text-xs text-red-400 lg:text-red-600 mt-1">{error}</p>}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && !error && (
          <p className="text-sm text-slate-500 text-center mt-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((m) => {
          if (m.senderRole === "system") {
            return (
              <p key={m._id} className="text-xs text-center text-slate-500 py-1">
                {m.text}
              </p>
            );
          }
          const mine = String(m.senderId) === String(currentUserId);
          return (
            <div
              key={m._id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-slate-800 lg:bg-slate-100 text-slate-100 lg:text-slate-900 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="p-3 border-t border-slate-800 lg:border-slate-200 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          disabled={!!error || disabled}
          className="flex-1 rounded-xl border border-slate-700 lg:border-slate-200 bg-slate-800 lg:bg-white text-slate-100 lg:text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending || !!error || disabled}
          className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
