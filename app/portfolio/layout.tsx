import { Metadata } from "next";

export const metadata: Metadata = {
  title: "State Compliance Portfolio Builder | MiSpark",
  description: "Organize student academic evidence, review mastery ratings, and generate printable portfolios for state evaluations.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}