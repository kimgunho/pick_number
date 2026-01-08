import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BorgWarner Lucky Draw Event",
  description: "BorgWarner Lucky Draw Event",
  generator: "",
  icons: {
    // icon: [
    //   {
    //     url: "/icon-light-32x32.png",
    //     media: "(prefers-color-scheme: light)",
    //   },
    //   {
    //     url: "/icon-dark-32x32.png",
    //     media: "(prefers-color-scheme: dark)",
    //   },
    //   {
    //     url: "/icon.svg",
    //     type: "image/svg+xml",
    //   },
    // ],
    // apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geist.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
