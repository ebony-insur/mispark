import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features & Capabilities | MiSpark",
  description: "Discover MiSpark's automated state standards mapping, hyper-personalized multi-sensory curriculum design, printable portfolios, and adaptive AI feedback loop.",
  keywords: [
    "AI lesson plan generator features",
    "state standards compliance planner",
    "homeschool portfolio builder",
    "differentiated instruction software"
  ],
  openGraph: {
    title: "Features & Capabilities | MiSpark",
    description: "Everything you need to teach with confidence using automated state compliance and personalized AI lesson planning.",
    type: "website",
  }
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}