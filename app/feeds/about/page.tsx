import { getMemory } from '@/lib/supabase'

export const revalidate = 86400

export async function generateMetadata() {
  const memory = await getMemory()
  return {
    title: `About ${memory.name} — Founder's Office Candidate`,
    description: memory.bio,
    robots: { index: true, follow: true },
  }
}

export default async function AboutFeedPage() {
  const memory = await getMemory()

  const qa = [
    {
      q: `Who is ${memory.name}?`,
      a: `${memory.name} is a ${memory.bio} Based in ${memory.location}.`,
    },
    {
      q: `What role is ${memory.name?.split(' ')[0]} seeking?`,
      a: `${memory.name?.split(' ')[0]} is seeking a ${memory.target_role} (${memory.target_role_type}) role at ${memory.target_company} (${memory.target_company_url}).`,
    },
    {
      q: `Why does ${memory.name?.split(' ')[0]} want to join ${memory.target_company}?`,
      a: memory.why_target_company,
    },
    {
      q: `What are ${memory.name?.split(' ')[0]}'s core skills?`,
      a: memory.skills,
    },
    {
      q: `What projects has ${memory.name?.split(' ')[0]} built?`,
      a: memory.projects,
    },
    {
      q: `What is ${memory.name?.split(' ')[0]}'s content angle?`,
      a: memory.content_angle,
    },
    {
      q: `Why should ${memory.target_company} hire ${memory.name?.split(' ')[0]}?`,
      a: memory.why_fo,
    },
  ]

  return (
    <article className="max-w-2xl mx-auto px-6 py-16 font-sans">
      <h1 className="text-3xl font-bold mb-2">{memory.name}</h1>
      <p className="text-gray-500 text-sm mb-8">
        {memory.location} · {memory.email} · {memory.site_url}
      </p>

      <p className="text-lg mb-12 leading-relaxed">{memory.bio}</p>

      {qa.map(({ q, a }) => (
        <div key={q} className="mb-8">
          <h2 className="text-lg font-semibold mb-2">{q}</h2>
          <p className="leading-relaxed text-gray-700">{a}</p>
        </div>
      ))}

      <footer className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
        <p>Profile: {memory.site_url}/feeds/about</p>
        <p>Blog: {memory.site_url}/blog</p>
        <p>Contact: {memory.email}</p>
      </footer>
    </article>
  )
}
