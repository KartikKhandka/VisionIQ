import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { CustomCursor } from "@/components/ui/custom-cursor";

const barlow = Barlow({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-barlow'
});

const barlowCondensed = Barlow_Condensed({ 
  weight: ['700', '800', '900'],
  subsets: ["latin"],
  variable: '--font-barlow-condensed'
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  title: "VisionIQ",
  description: "AI Appliance Copilot — Understand Any Home Appliance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${barlow.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable} font-body`}>
        <CustomCursor />
        <Providers>
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'font-medium rounded-xl shadow-lg border border-white/10',
              style: {
                background: 'hsl(220 33% 10%)',
                color: '#e2e8f0',
                padding: '16px',
                borderRadius: '16px',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
              },
              success: {
                iconTheme: {
                  primary: '#34d399',
                  secondary: '#0B0F1A',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f87171',
                  secondary: '#0B0F1A',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
