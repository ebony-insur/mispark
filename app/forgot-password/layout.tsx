import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | MiSpark",
  description: "Recover access to your MiSpark account.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}