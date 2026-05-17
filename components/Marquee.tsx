'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Lottie = dynamic(() => import('lottie-react'), { ssr: false }) as any

interface MarqueeProps {
  items: string[]
}

export default function Marquee({ items }: MarqueeProps) {
  const text = items.join('  ·  ') + '  ·  '
  const doubled = text + text // duplicate for seamless loop

  const [animData, setAnimData] = useState(null)

  useEffect(() => {
    fetch('/lottie-runner.json')
      .then((r) => r.json())
      .then(setAnimData)
      .catch(() => null)
  }, [])

  return (
    <div className="w-full bg-[#7C3AED] overflow-hidden flex items-center py-3 gap-4">
      {/* Lottie runner */}
      {animData && (
        <div className="flex-shrink-0 w-12 h-12 ml-2">
          <Lottie
            animationData={animData}
            loop
            autoplay
            style={{ width: 48, height: 48 }}
          />
        </div>
      )}

      {/* Scrolling text */}
      <div className="overflow-hidden flex-1">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-white font-medium text-sm tracking-wide pr-8">
            {doubled}
          </span>
        </div>
      </div>
    </div>
  )
}
