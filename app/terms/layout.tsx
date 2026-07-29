import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | MiSpark",
  description: "Read MiSpark's terms of service, educational disclaimers, affiliate disclosure, and subscription policies.",
  keywords: [
    "MiSpark terms of service", 
    "homeschool planner terms", 
    "Amazon affiliate disclosure MiSpark", 
    "educational AI disclaimer"
  ],
  openGraph: {
    title: "Terms of Service | MiSpark",
    description: "Read the terms and conditions governing the use of MiSpark's AI curriculum planner.",
    type: "website",
  }
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}