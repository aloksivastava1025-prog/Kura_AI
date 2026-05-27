import type { Metadata } from "next";
import { Oswald, PT_Sans } from "next/font/google";
import "./globals.css";

const ptSans = PT_Sans({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const oswald = Oswald({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Kura AI — Discover AI Art, Photography & Design",
    template: "%s | Kura AI",
  },
  description: "A premium visual-first social discovery platform. Explore infinite grids of AI-generated art, aesthetic design inspiration, and high-res photography.",
  keywords: ["AI Art", "Midjourney prompts", "Design inspiration", "Aesthetic blueprints", "Pinterest alternative", "Photography portfolio", "Visual discovery"],
  authors: [{ name: "Kura AI Team" }],
  creator: "Kura AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kura-ai.vercel.app/",
    siteName: "Kura AI",
    title: "Kura AI — Discover Premium AI Art & Design",
    description: "The ultimate aesthetic platform for AI artists and designers to showcase their work, share prompts, and build an audience.",
    images: [
      {
        url: "/images/eternal_archive.png", // Fallback OG image
        width: 1200,
        height: 630,
        alt: "Kura AI Discovery Grid",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kura AI — Discover Premium AI Art & Design",
    description: "The ultimate aesthetic platform for AI artists and designers to showcase their work.",
    images: ["/images/eternal_archive.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning className={`${ptSans.variable} ${oswald.variable} antialiased min-h-full flex flex-col bg-bg-layout text-txt-primary`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

