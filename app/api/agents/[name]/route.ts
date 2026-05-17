import { NextRequest, NextResponse } from 'next/server'

// Valid agent names — allowlist only
const VALID_AGENTS = ['research', 'content', 'content-manual', 'seo', 'distribution', 'discovery']

// n8n webhook URLs — set these in env after creating n8n workflows
const N8N_WEBHOOKS: Record<string, string> = {
  research:       process.env.N8N_WEBHOOK_RESEARCH ?? '',
  content:        process.env.N8N_WEBHOOK_CONTENT ?? '',
  'content-manual': process.env.N8N_WEBHOOK_CONTENT_MANUAL ?? '',
  seo:            process.env.N8N_WEBHOOK_SEO ?? '',
  distribution:   process.env.N8N_WEBHOOK_DISTRIBUTION ?? '',
  discovery:      process.env.N8N_WEBHOOK_DISCOVERY ?? '',
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  // Auth check
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== process.env.AGENT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await params

  // Allowlist check
  if (!VALID_AGENTS.includes(name)) {
    return NextResponse.json({ error: `Unknown agent: ${name}` }, { status: 400 })
  }

  const webhookUrl = N8N_WEBHOOKS[name]
  if (!webhookUrl) {
    return NextResponse.json(
      { error: `Agent ${name} webhook URL not configured` },
      { status: 503 }
    )
  }

  // Get body to forward to n8n
  const body = await req.json().catch(() => ({}))

  // Fire and forget — respond 200 immediately, n8n does the work
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': process.env.AGENT_WEBHOOK_SECRET ?? '',
    },
    body: JSON.stringify(body),
  }).catch((err) => {
    console.error(`[agents/${name}] Failed to trigger n8n webhook:`, err)
  })

  return NextResponse.json({
    triggered: true,
    agent: name,
    timestamp: new Date().toISOString(),
  })
}
