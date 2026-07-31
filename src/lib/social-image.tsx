// oxlint-disable react-perf/jsx-no-new-object-as-prop

import { ImageResponse } from "next/og"

export const socialImageAlt = "Briggs Davis, web design and development"
export const socialImageSize = { width: 1200, height: 630 }
export const socialImageContentType = "image/png"

export function createSocialImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#fafaf9",
        color: "#0c0a09",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        padding: "76px",
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "flex-start",
          border: "2px solid #d6d3d1",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "58px 64px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", fontSize: 42, fontWeight: 600 }}>Briggs Davis</div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 500,
            letterSpacing: "-3px",
            lineHeight: 1.05,
            maxWidth: "850px",
          }}
        >
          Websites for companies with somewhere to go.
        </div>
      </div>
    </div>,
    socialImageSize,
  )
}
