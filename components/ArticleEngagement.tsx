'use client'

import { useState, useRef } from 'react'

interface Comment {
  id: string
  name: string
  message: string
  created_at: string
}

interface Props {
  slug: string
  initialClaps: number
  initialComments: Comment[]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function ArticleEngagement({ slug, initialClaps, initialComments }: Props) {
  const [totalClaps, setTotalClaps] = useState(initialClaps)
  const [myClaps, setMyClaps] = useState(() => {
    if (typeof window === 'undefined') return 0
    return parseInt(localStorage.getItem(`claps_${slug}`) || '0', 10)
  })
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [burst, setBurst] = useState(false)
  const pendingClaps = useRef(0)
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const MAX_CLAPS = 50

  function handleClap() {
    if (myClaps >= MAX_CLAPS) return

    const newMyClaps = myClaps + 1
    setMyClaps(newMyClaps)
    setTotalClaps((t) => t + 1)
    localStorage.setItem(`claps_${slug}`, String(newMyClaps))
    pendingClaps.current += 1

    // Burst animation
    setBurst(true)
    setTimeout(() => setBurst(false), 300)

    // Debounce: flush to API 1s after last clap
    if (flushTimer.current) clearTimeout(flushTimer.current)
    flushTimer.current = setTimeout(async () => {
      const toSend = pendingClaps.current
      pendingClaps.current = 0
      await fetch(`/api/claps/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: toSend }),
      })
    }, 1000)
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSubmitting(true)

    const res = await fetch(`/api/comments/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
    })

    if (res.ok) {
      const newComment = await res.json()
      setComments((prev) => [newComment, ...prev])
      setName('')
      setMessage('')
    }
    setSubmitting(false)
  }

  const remaining = MAX_CLAPS - myClaps

  return (
    <div className="mt-16">
      {/* Engagement bar */}
      <div className="flex items-center gap-6 py-6 border-t border-b border-[#E4E4E7]">

        {/* Clap button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClap}
            disabled={myClaps >= MAX_CLAPS}
            title={remaining > 0 ? `${remaining} claps remaining` : 'Max claps reached'}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-150 select-none
              ${myClaps > 0
                ? 'border-[#6E4CEF] bg-[#EDE9FE]'
                : 'border-[#E4E4E7] bg-white hover:border-[#6E4CEF]'}
              ${burst ? 'scale-125' : 'scale-100'}
              ${myClaps >= MAX_CLAPS ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={myClaps > 0 ? '#6E4CEF' : 'none'} stroke={myClaps > 0 ? '#6E4CEF' : '#71717A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
              <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          </button>
          <span className="text-sm text-[#71717A] font-medium">{totalClaps}</span>
        </div>

        {/* Comment toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComments((v) => !v)}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
              ${showComments
                ? 'border-[#6E4CEF] bg-[#EDE9FE]'
                : 'border-[#E4E4E7] bg-white hover:border-[#6E4CEF]'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={showComments ? '#6E4CEF' : '#71717A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <span className="text-sm text-[#71717A] font-medium">{comments.length}</span>
        </div>

        {myClaps > 0 && (
          <p className="text-xs text-[#6E4CEF] ml-auto">
            You clapped {myClaps}x
          </p>
        )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-8">
          {/* Comment form */}
          <form onSubmit={handleComment} className="mb-10 flex flex-col gap-3">
            <p className="text-sm font-semibold text-[#09090B] mb-1">Leave a response</p>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full px-4 py-2 rounded-xl border border-[#E4E4E7] text-sm text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#6E4CEF] transition-colors"
            />
            <textarea
              placeholder="Share your thoughts..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-[#E4E4E7] text-sm text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#6E4CEF] transition-colors resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">{message.length}/500</span>
              <button
                type="submit"
                disabled={submitting || !name.trim() || !message.trim()}
                className="px-5 py-2 bg-[#6E4CEF] text-white text-sm font-medium rounded-full hover:bg-[#5B21B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Posting...' : 'Post response'}
              </button>
            </div>
          </form>

          {/* Comments list */}
          {comments.length > 0 ? (
            <div className="flex flex-col gap-6">
              {comments.map((c) => (
                <div key={c.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center text-xs font-bold text-[#6E4CEF]">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#09090B]">{c.name}</span>
                    <span className="text-xs text-[#A1A1AA]">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-[#3F3F46] leading-relaxed pl-9">{c.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#A1A1AA] text-center py-6">No responses yet. Be the first.</p>
          )}
        </div>
      )}
    </div>
  )
}
