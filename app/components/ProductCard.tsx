function HeartIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7M17 7H9M17 7v8" />
    </svg>
  );
}

function StarRating() {
  return (
    <div className="flex gap-0.5 text-medfinder-teal" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className="h-3.5 w-3.5 fill-current"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.77l-4.94 2.94.94-5.5-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductCard() {
  return (
    <article className="w-full max-w-sm rounded-3xl bg-medfinder-surface p-5 shadow-lg">
      <div className="relative mb-4 flex h-36 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
        <button
          type="button"
          aria-label="Add to favorites"
          className="absolute left-3 top-3 rounded-full bg-medfinder-surface p-1.5 text-medfinder-teal shadow-sm transition-colors hover:text-medfinder-teal-dark"
        >
          <HeartIcon />
        </button>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">
            Panadol
          </p>
          <p className="text-lg font-bold text-purple-900">Night</p>
        </div>
      </div>

      <StarRating />

      <h3 className="mt-2 text-sm font-bold tracking-wide text-medfinder-teal">
        PANADOL NIGHT
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-medfinder-muted">
        a dual-action medication that relieves nighttime aches and pains
      </p>

      <button
        type="button"
        className="mt-4 flex items-center gap-2 rounded-full bg-medfinder-teal px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-medfinder-teal-dark"
      >
        Find Now
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
          <ArrowIcon />
        </span>
      </button>
    </article>
  );
}
