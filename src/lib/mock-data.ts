export type ConsultMode = "video" | "chat" | "clinic";

export type Vet = {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviews: number;
  city: string;
  languages: string[];
  fee: number;
  avatarColor: string;
  bio: string;
  modes: ConsultMode[];
};

export type Pet = {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Rabbit" | "Bird";
  breed: string;
  age: number;
  weightKg: number;
};

export type Booking = {
  id: string;
  vetId: string;
  vetName: string;
  petName: string;
  mode: ConsultMode;
  date: string;
  slot: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  fee: number;
};

export const vets: Vet[] = [
  { id: "v1", name: "Dr. Aanya Mehra", specialty: "General + Dermatology", experience: 9, rating: 4.9, reviews: 312, city: "Bengaluru", languages: ["English","Hindi","Kannada"], fee: 499, avatarColor: "#3b82f6", bio: "Skin, ear, and allergy specialist for dogs and cats.", modes: ["video","chat","clinic"] },
  { id: "v2", name: "Dr. Rohan Kapoor", specialty: "Surgery + Orthopedics", experience: 14, rating: 4.8, reviews: 540, city: "Mumbai", languages: ["English","Hindi","Marathi"], fee: 799, avatarColor: "#1d4ed8", bio: "Fracture management, TPLO, soft-tissue surgery.", modes: ["video","clinic"] },
  { id: "v3", name: "Dr. Sneha Iyer", specialty: "Nutrition + Behaviour", experience: 6, rating: 4.95, reviews: 198, city: "Chennai", languages: ["English","Tamil"], fee: 399, avatarColor: "#60a5fa", bio: "Weight management and anxiety counselling.", modes: ["video","chat"] },
  { id: "v4", name: "Dr. Vikram Joshi", specialty: "Exotics + Avian", experience: 11, rating: 4.7, reviews: 142, city: "Pune", languages: ["English","Hindi"], fee: 699, avatarColor: "#2563eb", bio: "Birds, rabbits, reptiles — exotic specialist.", modes: ["video","clinic"] },
];

export const pets: Pet[] = [
  { id: "p1", name: "Biscuit", species: "Dog", breed: "Golden Retriever", age: 4, weightKg: 28 },
  { id: "p2", name: "Mochi",  species: "Cat", breed: "Scottish Fold",   age: 7, weightKg: 5 },
];

export const slots = ["09:00","09:30","10:00","11:00","11:30","14:00","15:30","17:00","18:30","19:00"];

export const bookings: Booking[] = [
  { id: "b1", vetId: "v1", vetName: "Dr. Aanya Mehra",  petName: "Biscuit", mode: "video",  date: "2026-06-04", slot: "11:00", status: "confirmed", fee: 499 },
  { id: "b2", vetId: "v3", vetName: "Dr. Sneha Iyer",   petName: "Mochi",   mode: "chat",   date: "2026-06-06", slot: "15:30", status: "pending",   fee: 399 },
  { id: "b3", vetId: "v2", vetName: "Dr. Rohan Kapoor", petName: "Biscuit", mode: "clinic", date: "2026-05-20", slot: "10:00", status: "completed", fee: 799 },
];
