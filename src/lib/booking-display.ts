import User from "@/models/User";
import Pet from "@/models/Pet";
import { getVetNamesByIds } from "@/lib/vet-resolve";

export function bookingStartAt(b: { startAt?: Date | string; date?: Date | string }) {
  const raw = b.startAt ?? b.date;
  return raw ? new Date(raw) : new Date(0);
}

export function durationMinutes(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
}

export function formatInrFromCents(cents?: number | null) {
  if (cents == null) return "—";
  return `₹${Math.round(cents / 100).toLocaleString("en-IN")}`;
}

export async function enrichBookingsForOwner(bookings: Record<string, unknown>[]) {
  if (!bookings.length) return [];
  const vetIds = [...new Set(bookings.map((b) => String(b.vetId)))];
  const vetMap = await getVetNamesByIds(vetIds);

  return bookings.map((b) => {
    const start = bookingStartAt(b as { startAt?: Date; date?: Date });
    const end = b.endAt ? new Date(b.endAt as string | Date) : new Date(start.getTime() + 30 * 60000);
    return {
      ...b,
      petName: (b.patientName as string) || (b.petName as string) || "Pet",
      vetName: vetMap[String(b.vetId)] || (b.vetName as string) || "Vet",
      ownerName: (b.ownerName as string) || "",
      date: start,
      startAt: start,
      endAt: end,
      durationMin: durationMinutes(start, end),
      fee: b.priceCents != null ? Math.round(Number(b.priceCents) / 100) : (b.fee as number | undefined),
    } as Record<string, unknown> & {
      _id: unknown;
      petName: string;
      vetName: string;
      ownerName: string;
      date: Date;
      startAt: Date;
      endAt: Date;
      durationMin: number;
      fee?: number;
      status: string;
      reason?: string;
      mode?: string;
    };
  });
}

export async function enrichPrescriptionsForOwner(items: Record<string, unknown>[]) {
  if (!items.length) return [];
  const petIds = [...new Set(items.map((r) => String(r.petId)))];
  const vetIds = [...new Set(items.map((r) => String(r.vetId)))];
  const [pets, vets] = await Promise.all([
    Pet.find({ _id: { $in: petIds } }).select("name").lean(),
    User.find({ _id: { $in: vetIds } }).select("name").lean(),
  ]);
  const petMap = Object.fromEntries(pets.map((p) => [String(p._id), p.name as string]));
  const vetMap = Object.fromEntries(vets.map((v) => [String(v._id), v.name as string]));

  return items.map((r) => ({
    ...r,
    medication: (r.drug as string) || (r.medication as string),
    dosage: [r.dose, r.frequency].filter(Boolean).join(" · ") || (r.dosage as string),
    petName: petMap[String(r.petId)] || (r.petName as string) || "Pet",
    vetName: vetMap[String(r.vetId)] || (r.vetName as string) || "Vet",
    active: r.status === "active",
  })) as (Record<string, unknown> & {
    _id: unknown;
    medication: string;
    dosage: string;
    petName: string;
    vetName: string;
    active: boolean;
    status?: string;
    issuedAt?: Date | string;
  })[];
}
