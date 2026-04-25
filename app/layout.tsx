import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/providers/app-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GeoSurvey · Project Management",
  description:
    "Geospatial, Drone, DGPS, LiDAR, Bathymetry, GIS/CAD & Tender management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}