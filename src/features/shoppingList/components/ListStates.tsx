import { FiShoppingCart } from 'react-icons/fi';

export function ErrorBanner({ error }: { error: string }) {
  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      ⚠️ {error}
    </div>
  );
}

export function LoadingList() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 animate-pulse">
          <div className="h-6 w-6 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-1">
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyListState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <FiShoppingCart className="mb-4 text-5xl" />
      <p className="text-lg font-medium">Listen er tom</p>
      <p className="mt-1 text-sm">Tilføj varer med feltet ovenfor</p>
    </div>
  );
}

