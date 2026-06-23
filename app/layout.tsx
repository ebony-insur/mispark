import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mi-spark.com"),
  title: "MiSpark",
  description: "Homeschool curriculum architect",
  openGraph: {
    title: "MiSpark",
    description: "Transform your homeschool schedule into engaging, neurodivergent-friendly activities.",
    url: "https://www.mi-spark.com",
    siteName: "MiSpark",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}