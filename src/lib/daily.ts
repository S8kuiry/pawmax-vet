const BASE = "https://api.daily.co/v1";
const KEY = process.env.DAILY_API_KEY!;

export async function createDailyRoom(name: string) {
  const r = await fetch(`${BASE}/rooms`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name, privacy: "private",
      properties: {
        enable_chat: true, enable_screenshare: true,
        exp: Math.floor(Date.now()/1000) + 60*60*3, // 3h
      },
    }),
  });
  if (!r.ok) throw new Error(`Daily room failed: ${await r.text()}`);
  return r.json() as Promise<{ name: string; url: string }>;
}

export async function createMeetingToken(roomName: string, userName: string, isOwner: boolean) {
  const r = await fetch(`${BASE}/meeting-tokens`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ properties: { room_name: roomName, user_name: userName, is_owner: isOwner } }),
  });
  if (!r.ok) throw new Error(`Daily token failed: ${await r.text()}`);
  return (await r.json()).token as string;
}
