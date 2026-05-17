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
                className="text-[#7C3AED] hover:underline"
              >
                {memory.target_company}&apos;s
              </a>{' '}
              AEO methodology — to get discovered by them.
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
            <div className="flex flex-col gap-2">
              {memory.linkedin_url && (
                <a
                  href={memory.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A1A1AA] hover:text-white text-sm transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {memory.twitter_url && (
                <a
                  href={memory.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A1A1AA] hover:text-white text-sm transition-colors"
                >
                  Twitter / X
                </a>
              )}
              {memory.medium_url && (
                <a
                  href={memory.medium_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A1A1AA] hover:text-white text-sm transition-colors"
                >
                  Medium
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#27272A] flex flex-col md:flex-row justify-between gap-3 text-xs text-[#52525B]">
          <p>© {new Date().getFullYear()} {memory.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
