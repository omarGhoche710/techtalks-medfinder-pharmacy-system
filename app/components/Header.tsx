import Link from "next/link";

const navLinks = ["For Pharma", "For Patients", "Reviews", "Team"];

function IconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="rounded-full p-2 text-medfinder-teal transition-colors hover:bg-medfinder-teal/10"
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
      <path d="M2 2h2l1.6 8.4a2 2 0 002 1.6h9.8a2 2 0 001.9-1.4L22 6H6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-5 md:px-12 lg:px-16">
      <Link
        href="/"
        className="text-xl font-bold tracking-wide text-medfinder-teal md:text-2xl"
      >
        MEDFINDER
      </Link>

      <nav
        className="hidden items-center gap-8 text-sm font-medium text-medfinder-teal md:flex"
        aria-label="Main navigation"
      >
        {navLinks.map((link) => (
          <a
            key={link}
            href="#"
            className="transition-colors hover:text-medfinder-teal-dark"
          >
            {link}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-1">
        <IconButton label="Search">
          <SearchIcon />
        </IconButton>
        <IconButton label="Cart">
          <CartIcon />
        </IconButton>
        <IconButton label="Menu">
          <MenuIcon />
        </IconButton>
      </div>
    </header>
  );
}
