import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030a14] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-[#1a2d4a] font-mono text-8xl font-bold">404</div>
        <p className="text-[#475569] font-mono tracking-widest uppercase text-sm">
          Signal Lost
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-5 py-2 rounded border border-cyan-500/30 text-cyan-400 font-mono text-sm hover:bg-cyan-500/10 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
