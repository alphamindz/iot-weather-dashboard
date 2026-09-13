export default function ConnectionError({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-ember-500/20 bg-ember-500/[0.06] p-8 text-center">
      <p className="font-display text-lg font-medium text-mist-200">Can't reach Supabase</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-mist-400">{message}</p>
    </div>
  );
}