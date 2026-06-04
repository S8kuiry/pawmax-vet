import { Video, MessageCircle } from "lucide-react";

export default function Page() {
  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">

<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
  
</div>


      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Live</p>
        <h1 className="text-3xl font-semibold">Consultations</h1>
        <p className="mt-2 text-slate-500">Active video and chat sessions with pet parents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { type: "video", pet: "Mia", owner: "Arjun Rao", duration: "12:04" },
          { type: "chat", pet: "Rocky", owner: "Sneha M.", duration: "03:21" },
        ].map((c, i) => {
          const Icon = c.type === "video" ? Video : MessageCircle;
          return (
            <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-blue-50 grid place-items-center">
                  <Icon className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">{c.pet}</p>
                  <p className="text-sm text-slate-500">{c.owner} · {c.duration}</p>
                </div>
              </div>
              <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm">Join</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
