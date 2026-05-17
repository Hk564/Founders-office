'use server'

/**
 * Server actions for the admin panel.
 * These run server-side, so secrets in env vars are safe here.
 */

export async function revalidateArticleAction(slug: string): Promise<{ ok: boolean }> {
  const secret = process.env.REVALIDATION_SECRET
  if (!secret) return { ok: false }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${base}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-revalidation-secret': secret,
    },
    body: JSON.stringify({ slug }),
  }).catch(() => null)

  return { ok: res?.ok ?? false }
}

export async function triggerAgentAction(
  name: string,
  body: Record<string, unknown> = {}
): Promise<{ ok: boolean }> {
  const secret = process.env.AGENT_WEBHOOK_SECRET
  if (!secret) return { ok: false }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${base}/api/agents/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': secret,
    },
    body: JSON.stringify(body),
  }).catch(() => null)

  return { ok: res?.ok ?? false }
}
