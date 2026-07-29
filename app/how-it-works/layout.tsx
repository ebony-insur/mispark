import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | MiSpark AI Homeschool Curriculum Planner",
  description: "Learn how MiSpark transforms raw topics and PDFs into hyper-personalized, state-aligned homeschool lesson plans in 4 simple steps.",
  keywords: [
    "homeschool planner", 
    "AI curriculum generator", 
    "state standards mapping", 
    "neurodivergent lesson plans", 
    "homeschool portfolio maker"
  ],
  openGraph: {
    title: "How It Works | MiSpark AI Planner",
    description: "Transform your homeschool prep time. See how our AI builds customized, multi-sensory lesson plans mapped to your state's standards.",
    type: "website",
  }
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}