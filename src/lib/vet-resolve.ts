import Vet from "@/models/Vet";
import User from "@/models/User";

export type ResolvedVet = {
  _id: unknown;
  name: string;
  consultationFee?: number;
  source: "vet" | "user";
};

export async function findVetById(vetId: string): Promise<ResolvedVet | null> {
  const vet = await Vet.findOne({
    _id: vetId,
    role: "vet",
    status: { $in: ["active", "draft"] },
  })
    .select("name consultationFee")
    .lean();

  if (vet) {
    return {
      _id: vet._id,
      name: vet.name as string,
      consultationFee: vet.consultationFee as number | undefined,
      source: "vet",
    };
  }

  const userVet = await User.findOne({ _id: vetId, role: "vet" })
    .select("name")
    .lean();

  if (userVet) {
    return {
      _id: userVet._id,
      name: userVet.name as string,
      source: "user",
    };
  }

  return null;
}

export async function getVetNamesByIds(vetIds: string[]): Promise<Record<string, string>> {
  if (!vetIds.length) return {};

  const [vets, users] = await Promise.all([
    Vet.find({ _id: { $in: vetIds } }).select("name").lean(),
    User.find({ _id: { $in: vetIds }, role: "vet" }).select("name").lean(),
  ]);

  const map: Record<string, string> = {};
  for (const v of vets) map[String(v._id)] = v.name as string;
  for (const u of users) {
    const id = String(u._id);
    if (!map[id]) map[id] = u.name as string;
  }
  return map;
}
