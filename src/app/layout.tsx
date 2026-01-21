import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkySign | Air Signature Capture",
  description: "Draw your signature in the air and capture it with your camera. The future of digital signatures.",
  keywords: ["signature", "e-signature", "digital signature", "air signature", "hand tracking"],
  openGraph: {
    title: "SkySign | Air Signature Capture",
    description: "Draw your signature in the air and capture it with your camera.",
    type: "website",
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
          colorPrimary: "#00f5ff",
          colorBackground: "#0a0a1a",
          colorInputBackground: "#1a1a2e",
          colorInputText: "#ffffff",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
