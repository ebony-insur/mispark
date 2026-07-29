import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Success Guide & Help | MiSpark",
  description: "Learn best practices for writing AI prompts, uploading homeschool syllabi, building state portfolios, and managing Sparks generation credits.",
  keywords: [
    "homeschool help guide", 
    "MiSpark tutorial", 
    "how to use AI lesson planner", 
    "homeschool portfolio tips"
  ],
  openGraph: {
    title: "Success Guide & Help | MiSpark",
    description: "Quick tips to help you save time, generate better lesson plans, and build beautiful state portfolios.",
    type: "website",
  }
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}