import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-3xl font-bold tracking-tight">ApplyMate</h1>
      <p className="mt-2 text-zinc-600">
        AI-powered career matching and resume generation.
      </p>
      <nav className="mt-8 flex gap-4">
        <Link href="/profile" className="underline underline-offset-4">
          Profile
        </Link>
        <Link href="/jobs" className="underline underline-offset-4">
          Jobs
        </Link>
      </nav>
    </main>
  );
}
