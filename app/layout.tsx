import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/app/components/navbar";
// import { ThemeProvider } from "@/app/components/theme-provider"
import { SidebarProvider } from "@/app/components/ui/sidebar";
import { AppSidebar } from "@/app/components/app-sidebar";
import AuthProvider from "./context/auth-context";
import { Toaster } from "@/app/components/ui/sonner";

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
    <html lang="pt-BR">
      <body className={`${inter.className} dark`}>
        {/* <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange> */}
        <AuthProvider>
          <SidebarProvider defaultOpen={false}>
            <div className="flex flex-col h-screen w-full">
              <Navbar />
              <div className="flex flex-1 overflow-hidden">
                <AppSidebar />
                <main className="flex-1 overflow-auto" id="scrollableMain">
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
