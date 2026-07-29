import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sparks Rewards Center | MiSpark",
  description: "Manage your MiSpark balance, purchase asset packs, or complete social quests to earn free lesson planning credits.",
  keywords: [
    "MiSpark rewards", 
    "homeschool curriculum credits", 
    "buy sparks", 
    "earn free lesson plans",
    "MiSpark token balance"
  ],
  openGraph: {
    title: "Sparks Rewards Center | MiSpark",
    description: "Manage your balance and earn free AI generation credits by sharing MiSpark with other homeschooling families.",
    type: "website",
  }
};

export default function RewardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}