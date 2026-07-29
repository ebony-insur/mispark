import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In or Sign Up | MiSpark AI Homeschool Planner",
  description: "Log in to your MiSpark account or sign up free to generate custom, state-aligned homeschool lesson plans.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}