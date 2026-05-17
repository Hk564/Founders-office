import { supabase } from '@/lib/supabase'
import type { MetadataRoute } from 'next'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://foundersoffice.xyz'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/feeds/about`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/feeds/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/feeds/gushwork`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/discovered`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
  ]

  const { data: articles } = await supabase
    .from('content_articles')
    .select('slug, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map((article) => ({
    url: `${base}/blog/${article.slug}`,
    lastModified: article.published_at ? new Date(article.published_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...articleRoutes]
}
