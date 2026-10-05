import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2026 글로컬 부산관광 트래블톤 공모전 공식 메타데이터
export const metadata: Metadata = {
  title: "2026 글로컬 부산관광 트래블톤 공모전 | 공식 플랫폼",
  description:
    "글로벌과 로컬을 잇는 새로운 부산 여행의 시작! 총 상금 3,000만원, 무박 2일 메이커톤 & 아이디어톤 온라인 접수처",
  keywords: [
    "부산관광",
    "트래블톤",
    "부산트래블톤",
    "글로컬관광",
    "부산관광공사",
    "아이디어톤",
    "해커톤",
    "스마트관광",
    "2026공모전",
  ],
  authors: [{ name: "부산광역시 · 부산관광공사" }],
  openGraph: {
    title: "2026 글로컬 부산관광 트래블톤 공모전",
    description: "무박 2일 부산 관광 메이커톤 - 온라인 참가신청 및 서류 제출",
    siteName: "2026 글로컬 부산관광 트래블톤",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
