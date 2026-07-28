import type { SearchState } from "@/lib/types";

type SearchStateViewProps = {
  state: SearchState;
  query?: string;
  error?: string | null;
  onRetry?: () => void;
};

export default function SearchStateView({
  state,
  query,
  error,
  onRetry,
}: SearchStateViewProps) {
  if (state === "idle") {
    return (
      <div className="card-panel border-dashed">
        <svg
          className="mb-4 h-12 w-12 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
          />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">
          Search for a medication
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Type a medicine name and press Enter to find pharmacies that carry it.
        </p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading search results"
        className="card-panel"
      >
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--primary)]" />
        <p className="mt-4 text-sm font-medium text-gray-700">
          Searching for &ldquo;{query}&rdquo;…
        </p>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="card-panel"
      >
        <svg
          className="mb-4 h-12 w-12 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">No results found</h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          No pharmacies found for &ldquo;{query}&rdquo;. Try a different
          medication name or turn off Near Me.
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center"
      >
        <svg
          className="mb-4 h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-lg font-semibold text-red-900">Search failed</h2>
        <p className="mt-2 max-w-sm text-sm text-red-700">
          {error ?? "Something went wrong. Please try again."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn-primary-sm mt-4 px-6"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return null;
}
