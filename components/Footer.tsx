export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white px-8 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">MedFinder</h3>
          <p className="mt-2 max-w-xs text-sm text-gray-500">
            Accessible medicine and ease of control is our main focus.
          </p>
        </div>

        <div className="flex gap-16">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Features</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>Core features</li>
              <li>Pro experience</li>
              <li>Focus</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Learn more</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>Blog</li>
              <li>Case studies</li>
              <li>Customer stories</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li>Contact</li>
              <li>Help center</li>
              <li>FAQ</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
