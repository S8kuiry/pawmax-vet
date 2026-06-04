export type ClientMessage = {
  _id: string;
  senderId: string;
  senderRole: "vet" | "owner" | "system";
  text: string;
  createdAt: string;
};

export function formatMessageForClient(m: {
  _id: unknown;
  sender?: unknown;
  senderRole: string;
  text?: string;
  createdAt?: unknown;
}): ClientMessage {
  return {
    _id: String(m._id),
    senderId: String(m.sender ?? ""),
    senderRole: m.senderRole as ClientMessage["senderRole"],
    text: String(m.text ?? ""),
    createdAt:
      m.createdAt instanceof Date
        ? m.createdAt.toISOString()
        : String(m.createdAt ?? new Date().toISOString()),
  };
}
