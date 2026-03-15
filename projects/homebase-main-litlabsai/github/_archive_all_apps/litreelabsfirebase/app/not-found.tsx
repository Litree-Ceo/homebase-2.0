export default function NotFound() {
  return (
    <main className="min-h-[60vh] grid place-items-center bg-slate-950 text-slate-50 p-8">
      <div className="text-center space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-xl">404</div>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-slate-300">The page you’re looking for doesn’t exist or was moved.</p>
        <a href="/" className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-400">
          Go home
        </a>
      </div>
    </main>
  );
}
