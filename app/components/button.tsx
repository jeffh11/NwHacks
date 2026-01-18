interface ButtonProps {
  text: string;
  onClick?: () => void;
}

export default function Button({ text, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-black py-3 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all duration-200"
    >
      {text}
    </button>
  );
}
