type JobPageProps = {
  params: { id: string };
};

export default function JobDetailPage({ params }: JobPageProps) {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Job Details</h1>
      <p className="mt-2 text-zinc-600">Job ID: {params.id}</p>
    </main>
  );
}
