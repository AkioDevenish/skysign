import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent', // No background as requested
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Container for SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="none"
        >
          {/* Cloud Outline - Soft Gray/Blue */}
          <path
            d="M25 19.5C25 21.9853 22.9853 24 20.5 24H9.5C6.46243 24 4 21.5376 4 18.5C4 15.637 6.18247 13.2802 8.9812 13.0156C9.36275 9.1764 12.5936 6.16669 16.5 6.16669C20.6421 6.16669 24 9.52455 24 13.6667C24 13.916 23.9857 14.1611 23.9579 14.4007C23.9719 14.3998 23.9859 14.3993 24 14.3993C26.7614 14.3993 29 16.6379 29 19.4L28.9953 19.6455C28.8778 22.0673 26.8906 24 24.45 24H20.5"
            stroke="#a8a29e" // stone-400
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Signature Line - Dark */}
          {/* A stylized 'S' curve representing a signature */}
          <path
            d="M8.5 22C11 15 14 17 16 20C18 23 21 16 23.5 12"
            stroke="#1c1917" // stone-900 (black)
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeOpacity="0.9"
            fill="none"
          />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
