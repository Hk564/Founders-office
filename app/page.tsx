import { getMemory } from '@/lib/supabase'
import { daysUntil } from '@/lib/utils'
import Marquee from '@/components/Marquee'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

const projects = [
  { name: 'Mylestones', description: 'E-commerce platform built 0-1 in 3 months', tag: '0-1 Product' },
  { name: 'Paaltu', description: 'Pet socialisation app â€" co-founder', tag: 'Co-founder' },
  { name: 'AI Regulatory Agent', description: 'Automated compliance agent using n8n + GPT', tag: 'AI Agent' },
]

const skills = [
  'Product', 'UX', 'Figma', 'SQL',
  'n8n', 'Supabase', 'AI Tools', 'Growth', '0-1 Building',
]

export default async function HomePage() {
  const memory = await getMemory()

  const days = memory.application_deadline
    ? daysUntil(memory.application_deadline)
    : null

  const marqueeItems = [
    memory.name || 'Harshitha K.L',
    'Product Builder',
    '0-1 Shipping',
    "Founder's Office",
    memory.location || 'Bengaluru',
    days !== null ? `${days} days to go` : null,
    'Growth Generalist',
    'Builder who executes',
  ].filter(Boolean) as string[]

  const { data: articles } = await supabase
    .from('content_articles')
    .select('id, title, slug, meta_description')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(8)

  return (
    <main className="flex flex-col min-h-screen">

      {/* â"€â"€ MARQUEE HEADER â"€â"€ */}
      <Marquee items={marqueeItems} />

      {/* HERO - full bleed video */}
      <section className="relative min-h-screen overflow-hidden bg-[#09090B]">

        {/* YouTube background video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/BN-mAzTaCIs?autoplay=1&mute=1&loop=1&controls=0&playlist=BN-mAzTaCIs&playsinline=1&rel=0&modestbranding=1&cc_load_policy=0&iv_load_policy=3"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ border: 'none', minWidth: '177.78vh', minHeight: '56.25vw', width: '100%', height: '115%', pointerEvents: 'none' }}
            allow="autoplay; fullscreen"
          />
        </div>

        {/* Dark overlay — also blocks YouTube controls from showing on hover */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content — left side */}
        <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 md:px-16">
          <div className="max-w-lg text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6E4CEF] font-medium mb-6">
              Cool, you found me!
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-6">
              Hi, I&apos;m{' '}
              <span className="text-[#6E4CEF]">
                {memory.name?.split(' ')[0] || 'Harshitha'}
              </span>.
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-10">
              {memory.bio}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/blog"
                className="px-8 py-3 bg-[#6E4CEF] text-white rounded-full font-medium hover:bg-[#5B21B6] transition-colors"
              >
                Read the articles
              </Link>
              <a
                href={`mailto:${memory.email}`}
                className="px-8 py-3 border border-white/30 text-white rounded-full font-medium hover:border-[#6E4CEF] hover:text-[#6E4CEF] transition-colors"
              >
                Get in touch
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* â"€â"€ JOURNEY + SKILLS â"€â"€ */}
      <section className="px-6 py-24 bg-[#EDE9FE]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[#6E4CEF] font-medium mb-3">
            Background
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#09090B] mb-16">
            My Journey + Skills
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {projects.map((project) => (
              <div key={project.name} className="bg-white rounded-2xl p-6 border border-[#E4E4E7] card-hover">
                <span className="inline-block text-xs font-medium text-[#6E4CEF] bg-[#EDE9FE] px-3 py-1 rounded-full mb-4">
                  {project.tag}
                </span>
                <h3 className="text-xl font-bold text-[#09090B] mb-2">{project.name}</h3>
                <p className="text-[#71717A] text-sm leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium text-[#71717A] uppercase tracking-wider mb-5">Skills</p>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-white border border-[#E4E4E7] rounded-full text-sm font-medium text-[#09090B] hover:border-[#6E4CEF] hover:text-[#6E4CEF] transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* â"€â"€ WHY NOT ME â"€â"€ */}
      <section className="px-6 py-24 bg-[#09090B]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[#6E4CEF] font-medium mb-3">
            The proof
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Not Me?
          </h2>
          <p className="text-[#71717A] text-lg mb-16 max-w-xl">
            {memory.content_angle}
          </p>

          {articles && articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group p-3 rounded-xl border border-[#27272A] hover:border-[#6E4CEF] transition-all card-hover"
                  >
                    <p className="text-white text-sm font-medium mb-1 group-hover:text-[#6E4CEF] transition-colors leading-snug">
                      {article.title}
                    </p>
                    <p className="text-[#6E4CEF] text-xs font-medium mt-1">Read →</p>
                  </Link>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link
                  href="/blog"
                  className="inline-block px-8 py-3 border border-[#27272A] text-white rounded-full text-sm font-medium hover:border-[#6E4CEF] hover:text-[#6E4CEF] transition-colors"
                >
                  View all articles
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#52525B] text-lg">Articles loading â€" engine is running.</p>
              <p className="text-[#71717A] text-sm mt-2">Check back tomorrow.</p>
            </div>
          )}
        </div>
      </section>

      {/* â"€â"€ FOOTER â"€â"€ */}
      <Footer memory={memory} />
    </main>
  )
}

