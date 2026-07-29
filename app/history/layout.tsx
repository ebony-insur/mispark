import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan History | MiSpark Dashboard",
  description: "Access and review your previously generated homeschool lesson plans.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}