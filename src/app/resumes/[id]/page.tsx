type ResumePageProps = {
  params: { id: string };
};

export default function ResumePage({ params }: ResumePageProps) {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Resume</h1>
      <p className="mt-2 text-zinc-600">Resume ID: {params.id}</p>
    </main>
  );
}
