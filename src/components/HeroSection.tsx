'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Award,
  Users,
  Download,
  UploadCloud,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import { COMPETITION_INFO, GOOGLE_DRIVE_FOLDER_URL, GOOGLE_SHEET_URL } from '@/lib/constants';

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

export default function HeroSection({ onScrollToSection }: HeroSectionProps) {
  // D-day 카운트다운 상태
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(COMPETITION_INFO.targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isExpired: false,
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* 배경 장식 요소: 오션 그라디언트 및 블러 오브 */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#071328] to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 미세한 그리드 배경 오버레이 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* 상단 뱃지 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold mb-6 shadow-lg shadow-cyan-950/50 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>2026 글로컬(Glocal) 부산 관광의 혁신을 이끌 메이커톤</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-bold">{COMPETITION_INFO.totalPrize}</span>
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight sm:leading-none mb-6">
          <span className="block text-slate-300 text-xl sm:text-2xl md:text-3xl font-medium tracking-normal mb-2">
            글로벌과 로컬의 만남, 바다 위의 아이디어톤
          </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
            2026 글로컬 부산관광
          </span>
          <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-300 sm:ml-4">
            트래블톤 공모전
          </span>
        </h1>

        {/* 서브 설명 */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-10">
          부산의 아름다운 해양과 원도심 골목, 첨단 AI 기술이 융합된 신개념 관광 비즈니스 모델을 찾습니다.
          <br className="hidden sm:inline" />
          전국 청년·대학생·메이커들이 함께하는 <strong className="text-cyan-300 font-semibold">2일간의 열정적인 아이디어 항해</strong>에 지금 도전하세요!
        </p>

        {/* D-Day 카운트다운 타이머 카드 */}
        <div className="max-w-2xl mx-auto mb-10 p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-lg shadow-2xl shadow-blue-950/40">
          <div className="flex items-center justify-between mb-3 text-xs sm:text-sm text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Calendar className="w-4 h-4" /> 접수 마감까지
            </span>
            <span className="text-slate-300 font-semibold">{COMPETITION_INFO.targetDateDisplay}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/60">
              <span className="block text-2xl sm:text-4xl font-extrabold text-white">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">DAYS</span>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/60">
              <span className="block text-2xl sm:text-4xl font-extrabold text-cyan-400">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">HOURS</span>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/60">
              <span className="block text-2xl sm:text-4xl font-extrabold text-blue-400">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">MINUTES</span>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/60">
              <span className="block text-2xl sm:text-4xl font-extrabold text-teal-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">SECONDS</span>
            </div>
          </div>
        </div>

        {/* CTA 핵심 버튼 3종 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          {/* 1. 참가 신청 & 업로드 바로가기 */}
          <button
            onClick={() => onScrollToSection('apply')}
            className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <UploadCloud className="w-5 h-5 text-slate-950 group-hover:-translate-y-0.5 transition-transform" />
            <span>온라인 팀 참가 신청 & 서류 업로드</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 2. 서식 다운로드 센터 */}
          <button
            onClick={() => onScrollToSection('downloads')}
            className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-500 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
          >
            <Download className="w-5 h-5 text-cyan-400" />
            <span>공모요강 & 양식 서식 다운로드</span>
          </button>

          {/* 3. 구글 드라이브 폴더 열기 */}
          <a
            href={GOOGLE_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <FolderOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>공식 구글 드라이브</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* 핵심 통계 및 특전 하단 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-slate-800/60 text-left">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-semibold">총 상금 규모</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-white">300만원</div>
            <p className="text-[11px] text-slate-400">대상 1팀 150만원 (부산시장상)</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-slate-800/60 text-left">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold">본선 트래블톤</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-white">2일간</div>
            <p className="text-[11px] text-slate-400">부산 벡스코 & 로컬 거점 연계</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-slate-800/60 text-left">
            <div className="flex items-center gap-2 text-teal-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold">참가 자격</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-white">팀 참가 필수</div>
            <p className="text-[11px] text-slate-400">2~4인 팀 구성 (개인 참가 불가)</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-slate-800/60 text-left">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold">사후 지원</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-white">입주 & 멘토링</div>
            <p className="text-[11px] text-slate-400">부산관광기업지원센터 입주 우대</p>
          </div>
        </div>

        {/* 스크롤 유도 인디케이터 */}
        <div
          onClick={() => onScrollToSection('overview')}
          className="mt-12 inline-flex flex-col items-center gap-1 text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors"
        >
          <span className="text-xs font-medium">더 알아보기</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
