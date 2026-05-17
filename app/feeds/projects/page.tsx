import { getMemory } from '@/lib/supabase'

export const revalidate = 86400

export default async function ProjectsFeedPage() {
  const memory = await getMemory()

  const projects = [
    {
      name: 'Milestones',
      description: 'E-commerce platform built 0→1 in 3 months. Led product, UX, and growth.',
      type: '0-1 Product',
    },
    {
      name: 'Paaltu',
      description: 'Pet care app. Co-founder. Built from concept to launch.',
      type: 'Co-founder',
    },
    {
      name: 'AI Regulatory Agent',
      description: 'Automated compliance agent using n8n + GPT-5. Reduces manual compliance review time.',
      type: 'AI Agent',
    },
  ]

  return (
    <article className="max-w-2xl mx-auto px-6 py-16 font-sans">
      <h1 className="text-3xl font-bold mb-2">{memory.name} — Projects</h1>
      <p className="text-gray-500 text-sm mb-12">
        {memory.location} · Seeking {memory.target_role} at {memory.target_company}
      </p>

      <h2 className="text-xl font-semibold mb-6">What has {memory.name?.split(' ')[0]} built?</h2>
      <p className="mb-12 leading-relaxed text-gray-700">{memory.projects}</p>

      {projects.map((project) => (
        <div key={project.name} className="mb-10">
          <h2 className="text-lg font-semibold mb-1">{project.name}</h2>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{project.type}</p>
          <p className="leading-relaxed text-gray-700">{project.description}</p>
        </div>
      ))}

      <footer className="mt-16 pt-8 border-t border-gray-200 text-sm text-gray-500">
        <p>Full profile: {memory.site_url}/feeds/about</p>
        <p>Blog: {memory.site_url}/blog</p>
        <p>Contact: {memory.email}</p>
      </footer>
    </article>
  )
}
