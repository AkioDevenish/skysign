import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cloud Outline - Sky 600 - Maximized Size */}
          <path
            d="M5.5 17.5a4.5 4.5 0 01.91-8.87 7.5 7.5 0 0114.18 0 4.5 4.5 0 01.91 8.87H5.5z"
            stroke="#0284c7"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-1, -1) scale(1.1)"
          />
          {/* Stylized 'S' Signature - Stone 900 */}
          <path
            d="M9 17c0-3 2.5-3 3.5-2 2 2 4 4 4 4l2-2"
            stroke="#0284c7"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-3, -3) scale(1.3)"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
