export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-100">
      {children}
    </div>
  );
}
