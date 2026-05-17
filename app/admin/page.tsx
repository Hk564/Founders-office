'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { revalidateArticleAction, triggerAgentAction } from './actions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Tab = 'memory' | 'content' | 'manual' | 'topics' | 'distribution' | 'seo' | 'discoveries' | 'settings'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('memory')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'memory', label: '🧠 Memory' },
    { id: 'content', label: '📝 Content Queue' },
    { id: 'manual', label: '✍️ Manual Input' },
    { id: 'topics', label: '🗂 Topics' },
    { id: 'distribution', label: '📤 Distribution' },
    { id: 'seo', label: '📊 SEO Report' },
    { id: 'discoveries', label: '🎉 Discoveries' },
    { id: 'settings', label: '⚙️ Settings' },
  ]

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Header */}
      <div className="border-b border-[#27272A] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#7C3AED] font-medium">foundersoffice.xyz</p>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <DiscoveryBadge />
      </div>

      {/* Tabs */}
      <div className="border-b border-[#27272A] px-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                tab === t.id
                  ? 'border-[#7C3AED] text-[#7C3AED]'
                  : 'border-transparent text-[#71717A] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {tab === 'memory' && <MemoryTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'manual' && <ManualTab />}
        {tab === 'topics' && <TopicsTab />}
        {tab === 'distribution' && <DistributionTab />}
        {tab === 'seo' && <SEOTab />}
        {tab === 'discoveries' && <DiscoveriesTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

// ── Discovery Badge ──
function DiscoveryBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const lastSeen = localStorage.getItem('discoveries_last_seen') ?? '1970-01-01'
    supabase
      .from('discoveries')
      .select('id', { count: 'exact' })
      .gt('discovered_at', lastSeen)
      .then(({ count }) => setCount(count ?? 0))
  }, [])

  if (count === 0) return null

  return (
    <div
      className="flex items-center gap-2 bg-[#7C3AED] px-4 py-2 rounded-full cursor-pointer"
      onClick={() => {
        localStorage.setItem('discoveries_last_seen', new Date().toISOString())
        setCount(0)
      }}
    >
      <span>🎉</span>
      <span className="text-sm font-medium">{count} new discovery</span>
    </div>
  )
}

// ── Tab 1: Memory ──
function MemoryTab() {
  const [rows, setRows] = useState<{ id: string; key: string; value: string }[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('memory_profile').select('*').order('key').then(({ data }) => {
      if (data) setRows(data)
    })
  }, [])

  async function saveRow(id: string, key: string, value: string) {
    setSaving(id)
    setError(null)
    const { error } = await supabase
      .from('memory_profile')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      setError('Save failed — please try again.')
    } else {
      setSaved(id)
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-2">Memory Profile</h2>
      <p className="text-[#71717A] text-sm mb-8">
        All agents read from here. Changing a value updates the entire system on the next run.
      </p>
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="flex gap-3 items-start">
            <span className="text-xs text-[#52525B] font-mono pt-3 w-48 shrink-0">{row.key}</span>
            <textarea
              defaultValue={row.value ?? ''}
              rows={row.value?.length > 80 ? 3 : 1}
              className="flex-1 bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white resize-none focus:border-[#7C3AED] focus:outline-none"
              onBlur={(e) => {
                if (e.target.value !== row.value) {
                  saveRow(row.id, row.key, e.target.value)
                }
              }}
            />
            <span className="text-xs pt-3 w-12 text-center">
              {saving === row.id ? '...' : saved === row.id ? '✅' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab 2: Content Queue ──
function ContentTab() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('content_articles')
      .select('id, title, slug, meta_description, status, created_at, source_type')
      .in('status', ['draft', 'approved'])
      .order('created_at', { ascending: false })
    setArticles(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function approve(id: string) {
    await supabase.from('content_articles').update({ status: 'approved' }).eq('id', id)
    load()
  }

  async function publish(id: string, slug: string) {
    setPublishing(id)
    await supabase
      .from('content_articles')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id)

    // Revalidate via server action (secret stays server-side)
    await revalidateArticleAction(slug).catch(() => {})

    setPublishing(null)
    load()
  }

  async function reject(id: string) {
    await supabase.from('content_articles').delete().eq('id', id)
    load()
  }

  if (loading) return <p className="text-[#71717A] text-sm">Loading...</p>

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Content Queue</h2>
      <p className="text-[#71717A] text-sm mb-8">
        {articles.length} article{articles.length !== 1 ? 's' : ''} waiting
      </p>

      {articles.length === 0 ? (
        <p className="text-[#52525B]">No drafts. Run Agent 3 to generate articles.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <div key={article.id} className="p-5 bg-[#18181B] rounded-2xl border border-[#27272A]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      article.status === 'approved'
                        ? 'bg-green-900/40 text-green-400'
                        : 'bg-[#27272A] text-[#71717A]'
                    }`}>
                      {article.status}
                    </span>
                    {article.source_type && article.source_type !== 'agent' && (
                      <span className="text-xs text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-full capitalize">
                        {article.source_type}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-white mb-1">{article.title}</p>
                  <p className="text-[#71717A] text-sm">{article.meta_description}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {article.status === 'draft' && (
                    <button
                      onClick={() => approve(article.id)}
                      className="px-3 py-1.5 bg-[#7C3AED] text-white text-xs rounded-lg hover:bg-[#5B21B6] transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {article.status === 'approved' && (
                    <button
                      onClick={() => publish(article.id, article.slug)}
                      disabled={publishing === article.id}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {publishing === article.id ? 'Publishing...' : 'Publish Live'}
                    </button>
                  )}
                  <button
                    onClick={() => reject(article.id)}
                    className="px-3 py-1.5 bg-[#27272A] text-[#71717A] text-xs rounded-lg hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tab 3: Manual Input ──
function ManualTab() {
  const [form, setForm] = useState({
    source_type: 'podcast',
    source_name: '',
    source_url: '',
    raw_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function generate() {
    if (!form.raw_notes.trim()) return
    setLoading(true)
    setDone(false)
    await triggerAgentAction('content-manual', form as Record<string, unknown>)
    setLoading(false)
    setDone(true)
    setForm({ source_type: 'podcast', source_name: '', source_url: '', raw_notes: '' })
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-2">Manual Content</h2>
      <p className="text-[#71717A] text-sm mb-8">
        Paste notes from a podcast, YouTube video, or article. Agent 3B converts them into an AEO article.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-[#71717A] uppercase tracking-wider mb-2 block">Source Type</label>
          <select
            value={form.source_type}
            onChange={(e) => setForm({ ...form, source_type: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:border-[#7C3AED] focus:outline-none"
          >
            <option value="podcast">Podcast</option>
            <option value="youtube">YouTube</option>
            <option value="article">Article</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-[#71717A] uppercase tracking-wider mb-2 block">Source Name</label>
          <input
            type="text"
            placeholder="e.g. Wholuck Podcast — Nayrhit B"
            value={form.source_name}
            onChange={(e) => setForm({ ...form, source_name: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:border-[#7C3AED] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-[#71717A] uppercase tracking-wider mb-2 block">Source URL</label>
          <input
            type="url"
            placeholder="https://"
            value={form.source_url}
            onChange={(e) => setForm({ ...form, source_url: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:border-[#7C3AED] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-[#71717A] uppercase tracking-wider mb-2 block">
            Raw Notes <span className="text-[#52525B] normal-case">(paste your takeaways)</span>
          </label>
          <textarea
            rows={8}
            placeholder="Paste your notes here..."
            value={form.raw_notes}
            onChange={(e) => setForm({ ...form, raw_notes: e.target.value })}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white resize-none focus:border-[#7C3AED] focus:outline-none"
          />
        </div>

        <button
          onClick={generate}
          disabled={loading || !form.raw_notes.trim()}
          className="px-6 py-3 bg-[#7C3AED] text-white rounded-lg font-medium hover:bg-[#5B21B6] transition-colors disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Article'}
        </button>

        {done && (
          <p className="text-green-400 text-sm">✅ Article generation triggered. Check Content Queue in a minute.</p>
        )}
      </div>
    </div>
  )
}

// ── Tab 4: Topics Queue ──
function TopicsTab() {
  const [topics, setTopics] = useState<any[]>([])
  const [newTopic, setNewTopic] = useState('')

  useEffect(() => {
    supabase.from('topics_queue').select('*').order('priority').then(({ data }) => {
      setTopics(data ?? [])
    })
  }, [])

  async function addTopic() {
    if (!newTopic.trim()) return
    await supabase.from('topics_queue').insert({
      topic: newTopic,
      search_query: newTopic,
      competition: 'low',
      priority: 99,
      used: false,
    })
    setNewTopic('')
    supabase.from('topics_queue').select('*').order('priority').then(({ data }) => setTopics(data ?? []))
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Topics Queue</h2>
      <p className="text-[#71717A] text-sm mb-8">
        {topics.filter((t) => !t.used).length} unused · {topics.filter((t) => t.used).length} used
      </p>

      {/* Add topic */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Add a topic..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTopic()}
          className="flex-1 bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:border-[#7C3AED] focus:outline-none"
        />
        <button
          onClick={addTopic}
          className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-[#5B21B6] transition-colors"
        >
          Add
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className={`flex items-center justify-between p-4 rounded-xl border ${
              topic.used ? 'border-[#1E1E21] opacity-40' : 'border-[#27272A]'
            } bg-[#18181B]`}
          >
            <div>
              <p className="text-sm text-white">{topic.topic}</p>
              <p className="text-xs text-[#52525B] mt-1">Priority: {topic.priority} · {topic.competition}</p>
            </div>
            <span className="text-xs text-[#52525B]">{topic.used ? 'Used ✓' : 'Unused'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab 5: Distribution ──
function DistributionTab() {
  const [queue, setQueue] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('distribution_queue')
      .select('*, content_articles(title)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setQueue(data ?? []))
  }, [])

  async function updateStatus(id: string, status: string) {
    await supabase.from('distribution_queue').update({ status }).eq('id', id)
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)))
  }

  const byPlatform = queue.reduce(
    (acc, item) => {
      const p = item.platform ?? 'other'
      acc[p] = acc[p] ?? []
      acc[p].push(item)
      return acc
    },
    {} as Record<string, any[]>
  )

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Distribution Queue</h2>
      <p className="text-[#71717A] text-sm mb-8">Approve each post before copying to platform.</p>

      {Object.entries(byPlatform).map(([platform, items]) => (
        <div key={platform} className="mb-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#7C3AED] mb-4 capitalize">
            {platform}
          </h3>
          <div className="flex flex-col gap-3">
            {(items as any[]).map((item) => (
              <div key={item.id} className="p-4 bg-[#18181B] rounded-xl border border-[#27272A]">
                <p className="text-xs text-[#52525B] mb-2">{item.content_articles?.title}</p>
                <p className="text-sm text-[#A1A1AA] leading-relaxed whitespace-pre-wrap mb-4">{item.content}</p>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'posted' ? 'bg-green-900/40 text-green-400' :
                    item.status === 'approved' ? 'bg-blue-900/40 text-blue-400' :
                    'bg-[#27272A] text-[#71717A]'
                  }`}>
                    {item.status}
                  </span>
                  {item.status === 'draft' && (
                    <button
                      onClick={() => updateStatus(item.id, 'approved')}
                      className="text-xs px-3 py-1 bg-[#7C3AED] text-white rounded-full hover:bg-[#5B21B6] transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {item.status === 'approved' && (
                    <button
                      onClick={() => updateStatus(item.id, 'posted')}
                      className="text-xs px-3 py-1 bg-green-700 text-white rounded-full hover:bg-green-800 transition-colors"
                    >
                      Mark posted
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {queue.length === 0 && (
        <p className="text-[#52525B]">No distribution drafts yet. Run Agent 5 after approving articles.</p>
      )}
    </div>
  )
}

// ── Tab 6: SEO Report ──
function SEOTab() {
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('seo_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setReport(data))
  }, [])

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-2">SEO Report</h2>
      <p className="text-[#71717A] text-sm mb-8">Latest daily report from Agent 4.</p>

      {report ? (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-[#52525B]">Report date: {report.report_date}</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Google Indexed', value: report.google_indexed ?? '—' },
              { label: 'Bing Indexed', value: report.bing_indexed ?? '—' },
              { label: 'AI Citations', value: report.perplexity_citations ?? '0' },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 bg-[#18181B] rounded-xl border border-[#27272A] text-center">
                <p className="text-2xl font-bold text-[#7C3AED]">{value}</p>
                <p className="text-xs text-[#71717A] mt-1">{label}</p>
              </div>
            ))}
          </div>
          {report.top_queries && (
            <div className="p-4 bg-[#18181B] rounded-xl border border-[#27272A]">
              <p className="text-xs text-[#71717A] uppercase tracking-wider mb-3">Top Queries</p>
              <pre className="text-xs text-[#A1A1AA] overflow-auto">
                {JSON.stringify(report.top_queries, null, 2)}
              </pre>
            </div>
          )}
          {report.notes && <p className="text-sm text-[#71717A]">{report.notes}</p>}
        </div>
      ) : (
        <p className="text-[#52525B]">No reports yet. Agent 4 runs daily at 8am IST.</p>
      )}
    </div>
  )
}

// ── Tab 7: Discoveries ──
function DiscoveriesTab() {
  const [discoveries, setDiscoveries] = useState<any[]>([])
  const [form, setForm] = useState({ platform: 'perplexity', query: '', notes: '' })
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('discoveries')
      .select('*')
      .order('discovered_at', { ascending: false })
    setDiscoveries(data ?? [])
    localStorage.setItem('discoveries_last_seen', new Date().toISOString())
  }, [])

  useEffect(() => { load() }, [load])

  async function addDiscovery() {
    setAdding(true)
    await supabase.from('discoveries').insert({
      ...form,
      discovered_at: new Date().toISOString(),
      email_sent: false,
    })
    setForm({ platform: 'perplexity', query: '', notes: '' })
    setAdding(false)
    load()
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-8">
        🎉 Discoveries — {discoveries.length} total
      </h2>

      {/* Add manual */}
      <div className="p-5 bg-[#18181B] rounded-2xl border border-[#27272A] mb-8">
        <p className="text-sm font-medium mb-4">Add manual discovery</p>
        <div className="flex flex-col gap-3">
          <select
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            className="bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white"
          >
            {['perplexity', 'chatgpt', 'claude', 'gemini', 'google'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Query that showed your site"
            value={form.query}
            onChange={(e) => setForm({ ...form, query: e.target.value })}
            className="bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white"
          />
          <input
            type="text"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white"
          />
          <button
            onClick={addDiscovery}
            disabled={adding}
            className="px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-[#5B21B6] disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add Discovery'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {discoveries.map((d) => (
          <div key={d.id} className="p-4 bg-[#18181B] rounded-xl border border-[#27272A]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🎉</span>
              <span className="font-medium capitalize">{d.platform}</span>
              <span className="text-xs text-[#52525B] ml-auto">
                {new Date(d.discovered_at).toLocaleDateString()}
              </span>
            </div>
            {d.query && <p className="text-sm text-[#7C3AED]">&ldquo;{d.query}&rdquo;</p>}
            {d.notes && <p className="text-xs text-[#71717A] mt-1">{d.notes}</p>}
          </div>
        ))}
        {discoveries.length === 0 && (
          <p className="text-[#52525B]">No discoveries yet. Engine is running — check back soon.</p>
        )}
      </div>
    </div>
  )
}

// ── Tab 8: Settings ──
function SettingsTab() {
  const [agentRuns, setAgentRuns] = useState<any[]>([])
  const [triggering, setTriggering] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('agent_runs')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setAgentRuns(data ?? []))
  }, [])

  async function triggerAgent(name: string) {
    setTriggering(name)
    await triggerAgentAction(name).catch(() => {})
    setTimeout(() => setTriggering(null), 2000)
  }

  const agents = ['research', 'content', 'seo', 'distribution', 'discovery']

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-8">Settings & Controls</h2>

      {/* Trigger agents */}
      <div className="mb-10">
        <p className="text-sm font-medium text-[#71717A] uppercase tracking-wider mb-4">Trigger Agents</p>
        <div className="flex flex-wrap gap-3">
          {agents.map((agent) => (
            <button
              key={agent}
              onClick={() => triggerAgent(agent)}
              disabled={triggering === agent}
              className="px-4 py-2 bg-[#18181B] border border-[#27272A] text-sm text-white rounded-lg hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors disabled:opacity-50 capitalize"
            >
              {triggering === agent ? '⏳ Triggered' : `Run ${agent}`}
            </button>
          ))}
        </div>
      </div>

      {/* Agent run logs */}
      <div>
        <p className="text-sm font-medium text-[#71717A] uppercase tracking-wider mb-4">Agent Run Log</p>
        {agentRuns.length === 0 ? (
          <p className="text-[#52525B] text-sm">No runs recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {agentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-3 bg-[#18181B] rounded-lg border border-[#27272A] text-sm">
                <div className="flex items-center gap-3">
                  <span>{run.status === 'success' ? '✅' : run.status === 'skipped' ? '⏭' : '❌'}</span>
                  <span className="capitalize text-white">{run.agent_name}</span>
                  {run.articles_created !== null && (
                    <span className="text-xs text-[#7C3AED]">{run.articles_created} articles</span>
                  )}
                  {run.error_message && (
                    <span className="text-xs text-red-400 truncate max-w-xs">{run.error_message}</span>
                  )}
                </div>
                <span className="text-xs text-[#52525B]">
                  {new Date(run.run_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
