import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Security Policy | MiSpark",
  description: "Learn how MiSpark protects your family's data with zero public AI training, strict database siloing, and enterprise security.",
  keywords: [
    "MiSpark privacy policy", 
    "homeschool app data security", 
    "COPPA compliance homeschool planner", 
    "AI data privacy"
  ],
  openGraph: {
    title: "Privacy & Security Policy | MiSpark",
    description: "We built MiSpark to keep your family's data safe from the open web.",
    type: "website",
  }
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}