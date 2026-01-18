import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}