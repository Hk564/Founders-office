import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data } = await supabaseAdmin
    .from('article_comments')
    .select('id, name, message, created_at')
    .eq('article_slug', slug)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { name, message } = await req.json()

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })
  }
  if (name.length > 50 || message.length > 500) {
    return NextResponse.json({ error: 'Input too long' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('article_comments')
    .insert({ article_slug: slug, name: name.trim(), message: message.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save' }, { status: 500 })

  return NextResponse.json(data)
}
