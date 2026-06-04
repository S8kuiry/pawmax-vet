export function homePathForRole(role: string): string {
  if (role === "vet") return "/vet/dashboard";
  if (role === "admin") return "/admin/vets";
  return "/owner/dashboard";
}

export function pathAfterRegister(role: "owner" | "vet"): string {
  return role === "vet" ? "/vet-onboarding" : "/owner/pets";
}
