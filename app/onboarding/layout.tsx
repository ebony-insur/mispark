import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome to MiSpark | Onboarding",
  description: "Get started with your AI-powered homeschool curriculum planner in 3 simple steps.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}