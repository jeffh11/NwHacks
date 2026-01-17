import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  // Updated title and description for Huddle branding
  title: "Huddle | Your Private Family Space",
  description:
    "Stay close to family, even when you're far away. Private updates, voice notes, and memories.",
  metadataBase: new URL(defaultUrl),
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body 
        className={`${geistSans.className} antialiased bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Added a max-width container to ensure content doesn't stretch 
            too far on ultra-wide monitors 
          */}
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}