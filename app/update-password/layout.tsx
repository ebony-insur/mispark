import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Password | MiSpark",
  description: "Securely update your MiSpark account password.",
  robots: {
    index: false,
    follow: false,
  }
};

export default function UpdatePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}