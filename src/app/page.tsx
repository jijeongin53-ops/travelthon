'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import OverviewSection from '@/components/OverviewSection';
import DownloadSection from '@/components/DownloadSection';
import ApplicationForm from '@/components/ApplicationForm';
import TimelineSection from '@/components/TimelineSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import PrivacyModal from '@/components/PrivacyModal';
import CheckApplicationModal from '@/components/CheckApplicationModal';

export default function Home() {
  // 모달 상태
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [privacyModalType, setPrivacyModalType] = useState<'collection' | 'thirdParty' | null>(null);

  // 부드러운 스크롤 이동
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 상단 네비게이션 바 */}
      <Navbar
        onOpenCheckModal={() => setIsCheckModalOpen(true)}
        onScrollToSection={scrollToSection}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-grow">
        {/* 1. 히어로 섹션 (D-Day 카운트다운, 주요 CTA 버튼) */}
        <HeroSection onScrollToSection={scrollToSection} />

        {/* 2. 대회 소개 & 4대 공모 분야 */}
        <OverviewSection />

        {/* 3. 공모요강 및 제출 서식 다운로드 센터 (HWP/DOCX/PDF 다운로드) */}
        <DownloadSection />

        {/* 4. 온라인 참가 신청 & 파일 업로드 폼 (구글 시트 & 드라이브 자동 연동) */}
        <ApplicationForm
          onOpenPrivacyModal={(type) => setPrivacyModalType(type)}
        />

        {/* 5. 시상 내역 및 대회 로드맵 타임라인 */}
        <TimelineSection />

        {/* 6. 자주 묻는 질문 (FAQ) */}
        <FaqSection />
      </main>

      {/* 하단 푸터 */}
      <Footer onScrollToTop={scrollToTop} />

      {/* 개인정보 약관 전문 모달 */}
      <PrivacyModal
        isOpen={Boolean(privacyModalType)}
        type={privacyModalType}
        onClose={() => setPrivacyModalType(null)}
        onAgree={(type) => {
          setPrivacyModalType(null);
        }}
      />

      {/* 접수 내역 확인 모달 */}
      <CheckApplicationModal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
      />
    </div>
  );
}
