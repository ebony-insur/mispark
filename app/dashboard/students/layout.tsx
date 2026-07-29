import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Household Profiles & Students | MiSpark",
  description: "Manage your learner profiles, grade levels, state standards, and digital backpack preferences.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}