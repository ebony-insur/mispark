import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recommended Homeschooling Tools & Apps | MiSpark Hub",
  description: "Explore MiSpark's curated list of the best apps and services for homeschooling, including Audible, Libby, and fast-delivery physical resources.",
  keywords: [
    "homeschool resources", 
    "homeschooling apps", 
    "Audible for kids", 
    "Libby app homeschool", 
    "MiSpark tools"
  ],
  openGraph: {
    title: "Homeschooling Tools & Apps | MiSpark Hub",
    description: "We curate the best resources to make personalized homeschooling easier and more affordable.",
    type: "website",
  }
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}