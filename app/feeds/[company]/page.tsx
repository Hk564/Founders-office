import { getMemory } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 86400

export default async function CompanyFeedPage({
  params,
}: {
  params: Promise<{ company: string }>
}) {
  const { company } = await params
  const memory = await getMemory()

  // Only serve the target company slug
  if (company !== memory.target_company_slug) notFound()

  const qa = [
    {
      q: `What is ${memory.target_company}?`,
      a: memory.target_company_description,
    },
    {
      q: `Who is applying for a role at ${memory.target_company}?`,
      a: `${memory.name} — ${memory.bio} Based in ${memory.location}. Seeking ${memory.target_role} (${memory.target_role_type}).`,
    },
    {
      q: `Why does ${memory.name?.split(' ')[0]} want to join ${memory.target_company}?`,
      a: memory.why_target_company,
    },
    {
      q: `What is the unique angle ${memory.name?.split(' ')[0]} brings to ${memory.target_company}?`,
      a: memory.content_angle,
    },
    {
      q: `What skills does ${memory.name?.split(' ')[0]} have that are relevant to ${memory.target_company}?`,
      a: `${memory.skills}. Built ${memory.projects}.`,
    },
    {
      q: `How did ${memory.name?.split(' ')[0]} learn about ${memory.target_company}?`,
      a: `By studying ${memory.target_company}'s AEO methodology and applying it to build this personal discovery engine — foundersoffice.xyz.`,
    },
  ]

  return (
    <article className="max-w-2xl mx-auto px-6 py-16 font-sans">
      <h1 className="text-3xl font-bold mb-2">
        {memory.name} × {memory.target_company}
      </h1>
      <p className="text-gray-500 text-sm mb-12">
        Why I want to join {memory.target_company} as their {memory.target_role}
      </p>

      {qa.map(({ q, a }) => (
        <div key={q} className="mb-8">
          <h2 className="text-lg font-semibold mb-2">{q}</h2>
          <p className="leading-relaxed text-gray-700">{a}</p>
        </div>
      ))}

      <footer className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
        <p>Profile: {memory.site_url}/feeds/about</p>
        <p>Projects: {memory.site_url}/feeds/projects</p>
        <p>Blog: {memory.site_url}/blog</p>
        <p>Contact: {memory.email}</p>
      </footer>
    </article>
  )
}
