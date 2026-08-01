import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css"; 
import { Toaster } from "sonner"; // <-- 1. Add this import

const inter = Inter({ subsets: ["latin"] });

// Global Fallback SEO Metadata
export const metadata: Metadata = {
  title: "Mi-Spark | Safe AI for Educators",
  description: "Generate custom learning supplements in seconds without exposing your child's data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* If you add a Supabase Auth Provider later, it wraps {children} here */}
        {children}
        
        {/* 2. Add the Toaster component right below children */}
        <Toaster richColors position="top-center" expand={true} />
      </body>
    </html>
  );
}