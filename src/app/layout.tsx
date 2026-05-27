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
  title: "Aesthetic Blueprints — Discover AI Art, Photography & Design",
  description: "A premium visual-first social discovery platform. Explore variable-height bento grids or experience the immersive vertical drum-scroll feed.",
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

