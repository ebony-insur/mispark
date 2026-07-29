import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lesson Plan Details | MiSpark History",
  description: "View and print your saved curriculum plans and upload student portfolio evidence.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function HistoryDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}