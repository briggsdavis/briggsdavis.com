"use client"

import { useEffect, useRef, type CSSProperties } from "react"

const services = [
  "Direction",
  "Support",
  "Launch",
  "Access",
  "UX",
  "CMS",
  "Motion",
  "Content",
  "Web design",
]

const fullRotation = 360

type ServiceItemStyle = CSSProperties & {
  "--service-angle": string
}

function createServiceItemStyle(angle: number): ServiceItemStyle {
  return { "--service-angle": `${angle}deg` }
}

function createServiceItems(labels: string[]) {
  if (labels.length === 0) {
    throw new Error("At least one service is required")
  }

  const angleStep = fullRotation / labels.length

  return labels.map((label, index) => ({
    label,
    style: createServiceItemStyle(index * angleStep),
  }))
}

const serviceItems = createServiceItems(services)

export function ServicesWheel() {
  const sectionRef = useRef<HTMLElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const wheel = wheelRef.current

    if (section === null || wheel === null) {
      throw new Error("Services wheel elements are required")
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frameId: number | null = null

    const update = () => {
      frameId = null

      if (reducedMotion.matches) {
        wheel.style.transform = ""
        return
      }

      const bounds = section.getBoundingClientRect()
      const scrollDistance = bounds.height - window.innerHeight
      const progress = Math.min(Math.max(-bounds.top / scrollDistance, 0), 1)

      wheel.style.transform = `rotateX(${-progress * fullRotation}deg)`
    }

    const requestUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    reducedMotion.addEventListener("change", requestUpdate)

    return () => {
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
      reducedMotion.removeEventListener("change", requestUpdate)

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <section
      className="h-[220svh] overflow-x-clip border-b border-stone-200 motion-reduce:h-auto"
      id="services"
      ref={sectionRef}
    >
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:relative motion-reduce:h-auto motion-reduce:overflow-visible">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-center gap-4 px-6 py-12 motion-reduce:min-h-svh lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-10">
          <div className="relative z-10">
            <h2 className="max-w-xl font-serif text-5xl tracking-tight sm:text-6xl">
              Everything a strong website needs.
            </h2>
            <p className="mt-7 max-w-lg text-lg leading-8 text-stone-600">
              We bring direction, design, and development together so every part of the website
              moves toward the same goal.
            </p>
          </div>

          <div
            className="relative grid min-h-88 place-items-center perspective-midrange perspective-origin-center lg:min-h-152"
            aria-hidden="true"
          >
            <div
              className="relative h-24 w-full max-w-md will-change-transform [--service-radius:8rem] transform-3d lg:h-32 lg:[--service-radius:11rem]"
              ref={wheelRef}
            >
              {serviceItems.map((item) => (
                <div
                  className="absolute inset-0 flex [transform:rotateX(var(--service-angle))_translateZ(var(--service-radius))] items-center justify-center text-center text-5xl font-bold tracking-tight whitespace-nowrap text-stone-950 uppercase backface-hidden sm:text-6xl lg:text-7xl"
                  key={item.label}
                  style={item.style}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <ol className="sr-only">
            {serviceItems.map((item) => (
              <li key={item.label}>{item.label}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
