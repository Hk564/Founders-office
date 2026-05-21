import Link from 'next/link'

interface FooterProps {
  memory: Record<string, string>
}

export default function Footer({ memory }: FooterProps) {
  return (
    <footer className="bg-[#09090B] text-[#FAFAFA] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* Left: identity */}
          <div className="flex flex-col gap-3 max-w-sm">
            <p className="text-xl font-semibold">{memory.name || 'Harshitha K.L'}</p>
            <p className="text-[#71717A] text-sm leading-relaxed">
              Built using{' '}
              <a
                href={`https://${memory.target_company_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6E4CEF] hover:underline"
              >
                {memory.target_company}&apos;s
              </a>{' '}
              AEO methodology â€” to get discovered by them.
            </p>
            <p className="text-[#71717A] text-sm">{memory.email}</p>
          </div>

          {/* Right: nav links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-[#71717A] font-medium mb-1">
              Navigate
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Blog', href: '/blog' },
                { label: 'About', href: '/feeds/about' },
                { label: 'Projects', href: '/feeds/projects' },
                { label: 'Discoveries', href: '/discovered' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#A1A1AA] hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-[#71717A] font-medium mb-1">
              Connect
            </p>
            <div className="flex gap-4 items-center">
              {memory.linkedin_url && (
                <a href={memory.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="text-[#A1A1AA] hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
              {memory.instagram_url && (
                <a href={memory.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="text-[#A1A1AA] hover:text-white transition-colors" aria-label="Instagram">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </a>
              )}
              {memory.medium_url && (
                <a href={memory.medium_url} target="_blank" rel="noopener noreferrer"
                  className="text-[#A1A1AA] hover:text-white transition-colors" aria-label="Medium">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#27272A] flex flex-col md:flex-row justify-between gap-3 text-xs text-[#52525B]">
          <p>Â© {new Date().getFullYear()} {memory.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

