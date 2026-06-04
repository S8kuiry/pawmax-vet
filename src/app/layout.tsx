import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./global.css";

export const metadata: Metadata = {
  title: "PetCare Vet — Online consultations for pets",
  description:
    "Book online video, chat or clinic consultations with verified veterinarians.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}