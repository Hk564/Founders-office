import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabaseAdmin
    .from('article_claps')
    .select('total_claps')
    .eq('article_slug', slug)
    .single()

  return NextResponse.json({ total_claps: data?.total_claps ?? 0 })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { count } = await req.json()
  const claps = Math.min(Math.max(1, Number(count) || 1), 50)

  // Try update first, then insert
  const { data: existing } = await supabaseAdmin
    .from('article_claps')
    .select('total_claps')
    .eq('article_slug', slug)
    .single()

  if (existing) {
    await supabaseAdmin
      .from('article_claps')
      .update({ total_claps: existing.total_claps + claps })
      .eq('article_slug', slug)
  } else {
    await supabaseAdmin
      .from('article_claps')
      .insert({ article_slug: slug, total_claps: claps })
  }

  return NextResponse.json({ ok: true })
}
