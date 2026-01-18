import { Camera, Video, Image as ImageIcon, X, Send } from "lucide-react";

export default function CreatePostPage() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100 p-6 md:p-10">
      
      {/* Background Glows (Same as Login/Signup) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-orange-300/60 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-amber-200/50 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header Section */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-orange-950 tracking-tight">Family Share</h1>
          <p className="text-orange-800/60 font-medium">Post a memory to your family chat</p>
        </div>

        {/* Main Post Container */}
        <div className="relative bg-white/95 border border-orange-200 shadow-[0_20px_50px_rgba(255,138,0,0.15)] rounded-3xl overflow-hidden backdrop-blur-md">
          
          {/* Top orange accent line */}
          <div className="h-2 w-full bg-gradient-to-r from-orange-300 via-orange-500 to-amber-400" />
          
          <div className="p-6">
            {/* Family Selector (Placeholder) */}
            <div className="mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2 block">Posting to:</label>
              <select className="w-full bg-orange-50 border border-orange-100 text-orange-900 text-sm rounded-xl p-2.5 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all">
                <option>The Johnson Family Chat</option>
                <option>Smith Family Reunion</option>
              </select>
            </div>

            {/* Text Input Bin */}
            <textarea 
              rows={5}
              className="w-full p-4 bg-transparent text-lg text-orange-950 placeholder:text-orange-200 border-none focus:ring-0 resize-none outline-none"
              placeholder="What's happening today?"
            />

            {/* Visual Media Preview (Placeholder for UI) */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
               <div className="relative min-w-[100px] h-[100px] bg-orange-50 rounded-2xl border-2 border-dashed border-orange-200 flex items-center justify-center text-orange-300">
                  <ImageIcon size={24} />
               </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-orange-100">
              <div className="flex gap-2">
                {/* Media Upload Buttons */}
                <button className="p-2.5 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                  <ImageIcon size={20} />
                </button>
                <button className="p-2.5 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                  <Video size={20} />
                </button>
                <button className="p-2.5 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                  <Camera size={20} />
                </button>
              </div>

              {/* Submit Button */}
              <button className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold shadow-lg shadow-orange-200 transition-all active:scale-95">
                <span>Post</span>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-orange-600 font-black">
          Only visible to your family
        </p>
      </div>
    </div>
  );
}