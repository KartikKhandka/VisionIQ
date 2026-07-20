import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
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
