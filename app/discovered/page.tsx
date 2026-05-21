import { supabase } from '@/lib/supabase'
import { getMemory } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import Footer from '@/components/Footer'

export const revalidate = 3600

export const metadata = {
  title: 'Discoveries â€” foundersoffice.xyz',
  description: 'Times when foundersoffice.xyz was cited by AI search engines.',
}

const platformEmoji: Record<string, string> = {
  chatgpt: 'ðŸ¤–',
  perplexity: 'ðŸ”',
  claude: 'ðŸ§ ',
  gemini: 'âœ¨',
  google: 'ðŸ”Ž',
}

export default async function DiscoveredPage() {
  const [memory, { data: discoveries }] = await Promise.all([
    getMemory(),
    supabase
      .from('discoveries')
      .select('*')
      .order('discovered_at', { ascending: false }),
  ])

  return (
    <main className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-[#6E4CEF] font-medium mb-3">
          The wholuck moment
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#09090B] mb-4">
          Discoveries ðŸŽ‰
        </h1>
        <p className="text-[#71717A] text-lg mb-6">
          Every time foundersoffice.xyz was cited by an AI search engine.
        </p>

        {/* North star goal */}
        <div className="inline-flex items-center gap-2 bg-[#EDE9FE] border border-[#DDD6FE] rounded-full px-5 py-2 mb-16">
          <span className="text-lg">ðŸŽ¯</span>
          <p className="text-sm font-medium text-[#6E4CEF]">
            North star: cited on ChatGPT for &ldquo;founder&apos;s office&rdquo;
          </p>
        </div>

        {discoveries && discoveries.length > 0 ? (
          <div className="flex flex-col gap-4">
            {discoveries.map((discovery) => (
              <div
                key={discovery.id}
                className="p-6 rounded-2xl border border-[#E4E4E7] bg-white card-hover"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {platformEmoji[discovery.platform?.toLowerCase()] ?? 'ðŸŒ'}
                    </span>
                    <div>
                      <p className="font-semibold text-[#09090B] capitalize">{discovery.platform}</p>
                      {discovery.query && (
                        <p className="text-sm text-[#6E4CEF] mt-0.5">&ldquo;{discovery.query}&rdquo;</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#71717A] shrink-0 mt-1">
                    {discovery.discovered_at ? formatDate(discovery.discovered_at) : ''}
                  </p>
                </div>
                {discovery.notes && (
                  <p className="text-sm text-[#71717A] mt-4 leading-relaxed">{discovery.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-2xl border-2 border-dashed border-[#E4E4E7]">
            <p className="text-4xl mb-4">â³</p>
            <p className="text-[#09090B] font-semibold text-lg mb-2">Not yet â€” but the engine is running.</p>
            <p className="text-[#71717A] text-sm max-w-sm mx-auto">
              {discoveries?.length === 0
                ? `${memory.name?.split(' ')[0]} is publishing daily. Citations take 2-4 weeks to appear.`
                : 'Check back soon.'}
            </p>
          </div>
        )}
      </div>

      <Footer memory={memory} />
    </main>
  )
}

