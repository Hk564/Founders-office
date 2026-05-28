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
  const { action } = await req.json() // action: 'clap' | 'unclap'

  const { data: existing } = await supabaseAdmin
    .from('article_claps')
    .select('total_claps')
    .eq('article_slug', slug)
    .single()

  const current = existing?.total_claps ?? 0

  if (action === 'unclap') {
    const newCount = Math.max(0, current - 1)
    if (existing) {
      await supabaseAdmin
        .from('article_claps')
        .update({ total_claps: newCount })
        .eq('article_slug', slug)
    }
    return NextResponse.json({ ok: true, total_claps: newCount })
  }

  // clap
  if (existing) {
    await supabaseAdmin
      .from('article_claps')
      .update({ total_claps: current + 1 })
      .eq('article_slug', slug)
  } else {
    await supabaseAdmin
      .from('article_claps')
      .insert({ article_slug: slug, total_claps: 1 })
  }

  return NextResponse.json({ ok: true, total_claps: current + 1 })
}
