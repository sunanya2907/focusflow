import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FocusFlow | Your Productivity Space",
  description: "Focus better, organize your tasks, and build productive habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* The ff-app class triggers the display: flex layout */}
        <div className="ff-app">
          {/* If you have a global Sidebar component, it goes here */}
          
          {/* The ff-main class ensures the content takes up the remaining space */}
          <main className="ff-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}