import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import SearchBar from "./components/SearchBar";

function ArrowCircleIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-medfinder-teal/30 text-medfinder-teal">
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
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

function HeroIllustration() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative h-[320px] w-[280px] overflow-hidden rounded-t-[140px] bg-medfinder-surface shadow-xl sm:h-[400px] sm:w-[340px] sm:rounded-t-[170px]">
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-slate-50 to-slate-100 pb-8">
          <div className="relative">
            <div className="h-28 w-36 rounded-lg border-2 border-slate-300 bg-gradient-to-b from-slate-200 to-slate-300 shadow-inner">
              <div className="absolute -top-16 left-1/2 flex -translate-x-1/2 flex-col items-center">
                <div className="h-20 w-24 rounded-t-full border-2 border-slate-400 bg-gradient-to-b from-slate-300 to-slate-400" />
                <div className="relative -mt-1 h-16 w-20">
                  <div className="absolute left-2 top-0 h-6 w-10 rotate-[-15deg] rounded bg-emerald-100 shadow-sm" />
                  <div className="absolute right-1 top-2 h-6 w-10 rotate-[10deg] rounded bg-white shadow-sm" />
                  <div className="absolute left-4 top-6 h-6 w-10 rotate-[5deg] rounded bg-emerald-50 shadow-sm" />
                  <div className="absolute right-3 top-8 h-6 w-10 rotate-[-8deg] rounded bg-slate-50 shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="absolute -right-2 top-1/2 -translate-y-1/2 rounded-full bg-medfinder-teal-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-medfinder-teal sm:right-0"
      >
        View All Products
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-full bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-6 pb-16 md:px-12 lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <section className="flex flex-col gap-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-medfinder-teal sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
                Your Digital
                <br />
                Medicine Finder
              </h1>

              <div className="flex items-start gap-3">
                <ArrowCircleIcon />
                <p className="max-w-md text-sm leading-relaxed text-medfinder-muted sm:text-base">
                  Search medicines by name and view dosage information,
                  alternatives, and availability.
                </p>
              </div>

              <SearchBar className="max-w-xl" />
            </div>

            <div className="hidden sm:block">
              <ProductCard />
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <HeroIllustration />
          </section>
        </div>

        <div className="mt-8 sm:hidden">
          <ProductCard />
        </div>
      </main>
    </div>
  );
}
