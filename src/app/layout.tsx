import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import ConvexClientProvider from "./ConvexClientProvider";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Replace with your actual Google Analytics 4 Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

export const metadata: Metadata = {
  title: "SkySign | Air Signature Capture",
  description: "Draw your signature in the air and capture it with your camera. The future of digital signatures.",
  keywords: ["signature", "e-signature", "digital signature", "air signature", "hand tracking", "document signing", "electronic signature"],
  authors: [{ name: "SkySign Team" }],
  icons: {
    icon: "/favicon.svg",
  },
  metadataBase: new URL("https://skysign.app"),
  openGraph: {
    title: "SkySign | Sign Documents in the Air",
    description: "The revolutionary e-signature platform that uses AI hand-tracking to capture your signature in mid-air. Secure, fast, and touchless.",
    type: "website",
    url: "https://skysign.app",
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
          {/* Google Analytics */}
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
        </head>


        <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
          <PostHogProvider>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
