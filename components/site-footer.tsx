const columns = [
  {
    title: 'Features',
    links: ['Core features', 'Pro experience', 'Integrations'],
  },
  {
    title: 'Learn more',
    links: ['Blog', 'Case studies', 'Customer stories', 'Best practices'],
  },
  {
    title: 'Support',
    links: ['Contact', 'Support', 'Legal'],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-120 border-t border-border bg-background px-6 py-12 md:px-10">
      <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
        <div className="max-w-sm">
          <h2 className="text-3xl font-bold text-foreground">MedFinder</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Accessible medicine and ease of control is our main focus.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}