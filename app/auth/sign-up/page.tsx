import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    // Matching the vibrant orange-to-amber background
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100 p-6 md:p-10">
      
      {/* Decorative ambient orange glows to match Login */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-orange-300/60 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-amber-200/50 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-orange-50/30" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* The Sign Up Box - White glassmorphism style */}
        <div className="relative bg-white/95 border border-orange-200 shadow-[0_20px_50px_rgba(255,138,0,0.15)] rounded-3xl p-1 overflow-hidden backdrop-blur-md">
          
          {/* Bolder top accent line */}
          <div className="h-2 w-full bg-gradient-to-r from-orange-300 via-orange-500 to-amber-400" />
          
          <div className="p-6">
            <SignUpForm />
          </div>
        </div>
        
        {/* Consistent Footer */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="h-px w-10 bg-orange-300/50" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-orange-600 font-black">
            Create Account
          </p>
          <div className="h-px w-10 bg-orange-300/50" />
        </div>
      </div>
    </div>
  );
}