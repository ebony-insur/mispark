import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Homeschool Idea Generator | MiSpark AI",
  description: "Discover hands-on learning ideas, educational toys, and books for your homeschooler in seconds. Just type an interest and let MiSpark do the rest.",
  keywords: [
    "homeschool ideas", 
    "educational toys generator", 
    "homeschool books", 
    "hands on learning activities", 
    "MiSpark discover"
  ],
  openGraph: {
    title: "Free Homeschool Idea Generator | MiSpark AI",
    description: "Type what your child is into right now, and our AI will find the perfect books and educational toys to match their grade level.",
    type: "website",
  }
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}