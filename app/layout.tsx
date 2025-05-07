import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/app/components/navbar";
// import { ThemeProvider } from "@/app/components/theme-provider"
import { SidebarProvider } from "@/app/components/ui/sidebar";
import { AppSidebar } from "@/app/components/app-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rise Worship",
  description: "Manage your worship group's songs and setlists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange> */}
        <SidebarProvider defaultOpen={false}>
          <div className="flex flex-col h-screen w-full">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              <AppSidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
        </SidebarProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
