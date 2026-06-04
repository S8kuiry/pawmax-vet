import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
        <p className="mt-2 text-slate-600">
          Password reset is not wired up yet. Contact support or sign in if you remember your password.
        </p>
        <Link href="/login" className="mt-6 inline-block text-brand-600 font-semibold">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
