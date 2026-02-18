import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Azerbaijan Gas Pipeline SCADA — Anomaly Detection",
  description:
    "Real-time SCADA dashboard for gas pipeline anomaly detection across Mardakan, Sumqayit, and Turkan monitoring stations.",
  keywords: [
    "SCADA",
    "pipeline monitoring",
    "anomaly detection",
    "Azerbaijan",
    "gas pipeline",
    "real-time",
  ],
  robots: "noindex, nofollow",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#030a14",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-[#030a14] text-[#e2e8f0] min-h-screen">
        {children}
      </body>
    </html>
  );
}
