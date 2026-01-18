import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    // Background: Increased vibrancy with orange-100 and amber-100
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100 p-6 md:p-10">
      
      {/* 1. More vibrant decorative glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Glow - increased opacity to 60% */}
        <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-orange-300/60 rounded-full blur-[100px]" />
        
        {/* Bottom Left Glow - added a warm amber */}
        <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-amber-200/50 rounded-full blur-[100px]" />
        
        {/* Center soft fill to ensure the orange feels "present" everywhere */}
        <div className="absolute inset-0 bg-orange-50/30" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* 2. The Login Box - kept white to remain "neat" and readable */}
        <div className="relative bg-white/95 border border-orange-200 shadow-[0_20px_50px_rgba(255,138,0,0.15)] rounded-3xl p-1 overflow-hidden backdrop-blur-md">
          
          {/* 3. Bolder top accent line */}
          <div className="h-2 w-full bg-gradient-to-r from-orange-300 via-orange-500 to-amber-400" />
          
          <div className="p-6">
            <LoginForm />
          </div>
        </div>
        
        {/* 4. Footer - darkened the text slightly so it's readable on the more vibrant background */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="h-px w-10 bg-orange-300/50" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-orange-600 font-black">
            Secure Entry
          </p>
          <div className="h-px w-10 bg-orange-300/50" />
        </div>
      </div>
    </div>
  );
}