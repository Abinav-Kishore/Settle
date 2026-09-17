import type { Metadata } from "next";
import "./globals.css";
import SmoothScroll from "@/components/Fx/SmoothScroll";
import Cursor from "@/components/Fx/Cursor";
import Spotlight from "@/components/Fx/Spotlight";
import ScrollFx from "@/components/Fx/ScrollFx";
import SectionDots from "@/components/Fx/SectionDots";

export const metadata: Metadata = {
  title: "SETTLE — Know what's due. Know what to do.",
  description:
    "SETTLE is an evidence-to-action platform for MSMEs dealing with delayed payments. It reconstructs fragmented business records into a clear, evidence-backed payment case and determines the next defensible action.",
  openGraph: {
    title: "SETTLE — Know what's due. Know what to do.",
    description:
      "Evidence-to-action platform for MSMEs. From fragmented records to a clear payment case.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Anton&family=Caveat:wght@500;600;700&family=Oswald:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SmoothScroll />
        <Cursor />
        <Spotlight />
        <ScrollFx />
        <SectionDots />
        {children}
      </body>
    </html>
  );
}
