import Link from "next/link";

export default function VetOnboardingPayoutsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-900">Payout setup</h1>
        <p className="mt-2 text-slate-600">
          Connect your payout account to receive consultation fees. This step will be completed here soon.
        </p>
        <Link href="/vet/dashboard" className="mt-6 inline-block text-brand-600 font-semibold">
          Go to vet dashboard
        </Link>
      </div>
    </div>
  );
}
