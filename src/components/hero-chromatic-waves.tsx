"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, type CSSProperties } from "react"

const ChromaticWaves = dynamic(() => import("./chromatic-waves"), {
  ssr: false,
})

const visualStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
}

const colors = ["#0c0a09", "#78716c", "#fb923c"]
const visualMediaQuery = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)"

export function HeroChromaticWaves() {
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(visualMediaQuery)
    const updateEnabled = () => {
      setIsEnabled(mediaQuery.matches)
    }

    updateEnabled()
    mediaQuery.addEventListener("change", updateEnabled)

    return () => {
      mediaQuery.removeEventListener("change", updateEnabled)
    }
  }, [])

  if (!isEnabled) {
    return null
  }

  return (
    <div
      className="chromatic-hero pointer-events-none absolute inset-y-0 right-0 w-2/3"
      aria-hidden
    >
      <ChromaticWaves
        frequency={4}
        speed={3}
        bgColor="#fafaf9"
        colors={colors}
        cellSize={28}
        gamma={7}
        paletteBias={-2}
        style={visualStyle}
      />
    </div>
  )
}
