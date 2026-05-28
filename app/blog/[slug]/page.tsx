import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getMemory } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import Footer from '@/components/Footer'
import ArticleEngagement from '@/components/ArticleEngagement'
import Link from 'next/link'
import Image from 'next/image'
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

  const [memory, { data: article }, clapsData, commentsData] = await Promise.all([
    getMemory(),
    supabase
      .from('content_articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single(),
    supabaseAdmin
      .from('article_claps')
      .select('total_claps')
      .eq('article_slug', slug)
      .single(),
    supabaseAdmin
      .from('article_comments')
      .select('id, name, message, created_at')
      .eq('article_slug', slug)
      .order('created_at', { ascending: false }),
  ])

  if (!article) notFound()

  const initialClaps = clapsData.data?.total_claps ?? 0
  const initialComments = commentsData.data ?? []

  // Convert markdown to HTML
  function inlineFormat(text: string) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // **bold**
      .replace(/\*(.+?)\*/g, '<em>$1</em>')               // *italic*
  }

  const paragraphs = article.content
    ?.split('\n')
    .filter((line: string) => line.trim())
    .map((line: string) => {
      if (line.startsWith('## ')) return `<h2>${inlineFormat(line.slice(3))}</h2>`
      if (line.startsWith('# '))  return `<h1>${inlineFormat(line.slice(2))}</h1>`
      if (line.startsWith('### ')) return `<h3>${inlineFormat(line.slice(4))}</h3>`
      // Bullet points: * text or - text
      if (/^[*-] /.test(line)) return `<li>${inlineFormat(line.slice(2))}</li>`
      // Numbered list: 1. text
      if (/^\d+\. /.test(line)) return `<li>${inlineFormat(line.replace(/^\d+\. /, ''))}</li>`
      return `<p>${inlineFormat(line)}</p>`
    })
    .join('')
    // Wrap consecutive <li> items in <ul>
    .replace(/((<li>[\s\S]*?<\/li>)\s*)+/g, '<ul>$&</ul>')

  return (
    <main className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-24">

        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[#71717A] hover:text-[#6E4CEF] transition-colors mb-12"
        >
          &larr; Back to blog
        </Link>

        {/* Header */}
        <div className="mb-12">
          {article.published_at && (
            <p className="text-xs text-[#71717A] mb-4">{formatDate(article.published_at)}</p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-[#71717A] text-lg leading-relaxed">{article.meta_description}</p>
        </div>

        {/* Hero image */}
        {article.cover_image && (
          <div className="mb-12 rounded-2xl overflow-hidden">
            <Image
              src={article.cover_image}
              alt={article.title}
              width={800}
              height={450}
              className="w-full object-cover"
              priority
            />
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-[#E4E4E7] mb-12" />

        {/* Content */}
        <div
          className="prose prose-zinc max-w-none text-[#09090B]
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:text-[#09090B]
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[#09090B]
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[#09090B]
            [&_p]:text-[#3F3F46] [&_p]:leading-relaxed [&_p]:mb-5
            [&_strong]:font-semibold [&_strong]:text-[#09090B]
            [&_ul]:mb-5 [&_ul]:pl-5 [&_ul]:list-disc
            [&_li]:text-[#3F3F46] [&_li]:leading-relaxed [&_li]:mb-2"
          dangerouslySetInnerHTML={{ __html: paragraphs || '' }}
        />

        {/* Engagement — claps + comments */}
        <ArticleEngagement
          slug={slug}
          initialClaps={initialClaps}
          initialComments={initialComments}
        />

      </div>

      <Footer memory={memory} />
    </main>
  )
}
