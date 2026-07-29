import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features | MiSpark AI Homeschool Curriculum Planner",
  description: "Discover automated state standards mapping, adaptive AI feedback loops, instant portfolios, and hyper-personalized homeschool lesson plans.",
  keywords: [
    "homeschool curriculum planner features",
    "state standards mapping app",
    "homeschool portfolio builder",
    "adaptive AI lesson planner"
  ],
  openGraph: {
    title: "Features | MiSpark AI Homeschool Planner",
    description: "Explore the powerful features behind MiSpark designed to save you hours of prep time.",
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
