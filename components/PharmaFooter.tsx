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
    links: ['Contact us', 'View team', 'Legal'],
  },
]

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[#D8E7DF] bg-[#FBFDFC] px-6 py-12 md:px-10">
      <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
        <div className="max-w-sm">
          <h2 className="text-3xl font-bold text-[#145C54]">MedFinder</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5B6B66]">
            Accessible medicine and ease of control is our main focus.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-[#1F2B29]">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[#5B6B66] transition-colors hover:text-[#145C54]"
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
    </footer >
  )
}