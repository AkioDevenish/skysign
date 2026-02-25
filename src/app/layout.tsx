import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import PaddleProvider from "@/components/PaddleProvider";
import ConvexClientProvider from "./ConvexClientProvider";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Only load Google Analytics when a real measurement ID is configured
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://skysign-app.vercel.app';

export const metadata: Metadata = {
  title: "SkySign | Air Signature Capture",
  description: "Draw your signature in the air and capture it with your camera. The future of digital signatures.",
  keywords: ["signature", "e-signature", "digital signature", "air signature", "hand tracking", "document signing", "electronic signature"],
  authors: [{ name: "SkySign Team" }],
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "SkySign | Sign Documents in the Air",
    description: "The revolutionary e-signature platform that uses AI hand-tracking to capture your signature in mid-air. Secure, fast, and touchless.",
    type: "website",
    url: APP_URL,
    siteName: "SkySign",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SkySign - Sign Documents in the Air",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkySign | Air Signature Capture",
    description: "Draw your signature in the air with AI hand-tracking. The future of digital signatures.",
    images: ["/og-image.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1c1917",
          colorBackground: "#ffffff",
          colorInputBackground: "#fafaf9",
          colorInputText: "#1c1917",
          colorText: "#1c1917",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Google Analytics — only when configured */}
          {GA_MEASUREMENT_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                `}
              </Script>
            </>
          )}
          {/* Paddle.js */}
          <Script
            src="https://cdn.paddle.com/paddle/v2/paddle.js"
            strategy="afterInteractive"
          />
        </head>


        <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
            <ConvexClientProvider>
              <PaddleProvider>
                <ToastProvider>{children}</ToastProvider>
              </PaddleProvider>
            </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
