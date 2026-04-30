import "./globals.css";

export const metadata = {
  title: "Job Application Tracker",
  description: "Kanban job tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}