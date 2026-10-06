'use client';

import React, { useState, useEffect } from 'react';
import { Compass, Menu, X, Search, ExternalLink, FileText, ChevronRight } from 'lucide-react';
import { GOOGLE_DRIVE_FOLDER_URL, GOOGLE_SHEET_URL } from '@/lib/constants';

interface NavbarProps {
  onOpenCheckModal: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function Navbar({ onOpenCheckModal, onScrollToSection }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: '대회 소개', id: 'overview' },
    { label: '공모 분야', id: 'tracks' },
    { label: '서식 다운로드', id: 'downloads' },
    { label: '참가 신청(업로드)', id: 'apply' },
    { label: '시상 & 일정', id: 'timeline' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/85 backdrop-blur-md shadow-lg shadow-black/20 border-b border-slate-800/80 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* 로고 영역 */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onScrollToSection('hero')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 p-0.5 shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  TRAVELTHON 2026
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  부산
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                글로컬 부산관광 트래블톤
              </h1>
            </div>
          </div>

          {/* 데스크톱 메뉴 링크 */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onScrollToSection(link.id)}
                className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-cyan-300 transition-colors rounded-lg hover:bg-slate-800/40"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* 우측 액션 버튼 */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* 접수 조회 버튼 */}
            <button
              onClick={onOpenCheckModal}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5 hover:border-slate-500 shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>접수 확인</span>
            </button>

            {/* 바로 신청하기 버튼 */}
            <button
              onClick={() => onScrollToSection('apply')}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 rounded-xl transition-all shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>참가 신청하기</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-5 space-y-2 mt-2 break-keep">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onScrollToSection(link.id);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium text-slate-200 hover:text-cyan-300 hover:bg-slate-900 rounded-lg transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenCheckModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>내 접수 내역 확인하기</span>
            </button>
            <button
              onClick={() => {
                onScrollToSection('apply');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>온라인 참가 신청 & 서류 제출</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
