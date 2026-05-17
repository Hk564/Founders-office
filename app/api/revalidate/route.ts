import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidation-secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const slug = body?.slug as string | undefined

  if (slug) {
    revalidatePath(`/blog/${slug}`)
  }

  // Always revalidate list pages
  revalidatePath('/blog')
  revalidatePath('/')
  revalidatePath('/sitemap.xml')

  return NextResponse.json({
    revalidated: true,
    slug: slug ?? 'all',
    timestamp: new Date().toISOString(),
  })
}
