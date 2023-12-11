
import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from 'next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/react';
import { cn, constructMetadata } from "@/lib/utils";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import 'simplebar-react/dist/simplebar.min.css'
const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
     
      <body
        className={cn(
          "min-h-screen font-sans antialiased grainy",
          inter.className
        )}
      >
         <Providers>
          <Toaster /> 
        <Navbar />
        {children}
        <SpeedInsights />
        <Analytics />
        </Providers>
      </body>
    
      
    </html>
  );
}
