import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Curriculum Planner | MiSpark Dashboard",
  description: "Transform topics, syllabi, or PDFs into multi-sensory, state-aligned homeschool lesson plans in seconds.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}