import { supabase } from '@/lib/supabase'
import { getMemory } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const revalidate = 3600

export const metadata = {
  title: "Blog — Harshitha K.L",
  description: "Articles on Founder's Office, AEO, product building, and growth at AI startups.",
}

export default async function BlogPage() {
  const [memory, { data: articles }] = await Promise.all([
    getMemory(),
    supabase
      .from('content_articles')
      .select('id, title, slug, meta_description, published_at, source_type')
      .eq('status', 'published')
      .order('published_at', { ascending: false }),
  ])

  return (
    <main className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-[#7C3AED] font-medium mb-3">
          All articles
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#09090B] mb-4">Blog</h1>
        <p className="text-[#71717A] text-lg mb-16">
          Writing on Founder&apos;s Office, AEO, product building, and growth at AI startups.
        </p>

        {articles && articles.length > 0 ? (
          <div className="flex flex-col divide-y divide-[#E4E4E7]">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group py-8 flex flex-col gap-2 hover:pl-2 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-1">
                  {article.source_type && article.source_type !== 'agent' && (
                    <span className="text-xs font-medium text-[#7C3AED] bg-[#EDE9FE] px-2 py-0.5 rounded-full capitalize">
                      {article.source_type}
                    </span>
                  )}
                  {article.published_at && (
                    <span className="text-xs text-[#71717A]">
                      {formatDate(article.published_at)}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-[#09090B] group-hover:text-[#7C3AED] transition-colors leading-snug">
                  {article.title}
                </h2>
                <p className="text-[#71717A] text-sm leading-relaxed">{article.meta_description}</p>
                <p className="text-[#7C3AED] text-sm font-medium mt-1">Read →</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-[#71717A] text-lg">No articles yet — engine is warming up.</p>
          </div>
        )}
      </div>

      <Footer memory={memory} />
    </main>
  )
}
