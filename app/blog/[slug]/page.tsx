import { supabase } from '@/lib/supabase'
import { getMemory } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabase
    .from('content_articles')
    .select('title, meta_description')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) return { title: 'Not Found' }

  return {
    title: data.title,
    description: data.meta_description,
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [memory, { data: article }] = await Promise.all([
    getMemory(),
    supabase
      .from('content_articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single(),
  ])

  if (!article) notFound()

  // Convert markdown to simple HTML paragraphs for now
  const paragraphs = article.content
    ?.split('\n')
    .filter((line: string) => line.trim())
    .map((line: string) => {
      if (line.startsWith('## ')) return `<h2>${line.replace('## ', '')}</h2>`
      if (line.startsWith('# ')) return `<h1>${line.replace('# ', '')}</h1>`
      if (line.startsWith('**') && line.endsWith('**')) return `<strong>${line.replace(/\*\*/g, '')}</strong>`
      return `<p>${line}</p>`
    })
    .join('')

  return (
    <main className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-24">

        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[#71717A] hover:text-[#7C3AED] transition-colors mb-12"
        >
          ← Back to blog
        </Link>

        {/* Header */}
        <div className="mb-12">
          {article.source_type && article.source_type !== 'agent' && (
            <span className="inline-block text-xs font-medium text-[#7C3AED] bg-[#EDE9FE] px-3 py-1 rounded-full mb-4 capitalize">
              {article.source_type}
            </span>
          )}
          {article.published_at && (
            <p className="text-xs text-[#71717A] mb-4">{formatDate(article.published_at)}</p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-[#71717A] text-lg leading-relaxed">{article.meta_description}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E4E4E7] mb-12" />

        {/* Content */}
        <div
          className="prose prose-zinc max-w-none text-[#09090B]
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:text-[#09090B]
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[#09090B]
            [&_p]:text-[#3F3F46] [&_p]:leading-relaxed [&_p]:mb-5
            [&_strong]:font-semibold [&_strong]:text-[#09090B]"
          dangerouslySetInnerHTML={{ __html: paragraphs || '' }}
        />

        {/* Author bio */}
        <div className="mt-16 p-6 rounded-2xl bg-[#EDE9FE] border border-[#DDD6FE]">
          <p className="text-xs uppercase tracking-wider text-[#7C3AED] font-medium mb-3">About the author</p>
          <p className="font-semibold text-[#09090B] mb-1">{memory.name}</p>
          <p className="text-sm text-[#71717A] leading-relaxed mb-3">{memory.bio}</p>
          <p className="text-sm text-[#71717A]">
            Seeking{' '}
            <span className="text-[#7C3AED] font-medium">{memory.target_role}</span>
            {' '}at{' '}
            <a
              href={`https://${memory.target_company_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#7C3AED] font-medium hover:underline"
            >
              {memory.target_company}
            </a>
          </p>
        </div>
      </div>

      <Footer memory={memory} />
    </main>
  )
}
