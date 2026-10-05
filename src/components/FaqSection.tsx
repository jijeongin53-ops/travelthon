'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare, PhoneCall, Mail } from 'lucide-react';
import { FAQS } from '@/lib/constants';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative bg-slate-950 border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-3 border border-cyan-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ & 지원 안내</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            자주 묻는 질문
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            대회 참가 및 신청서 제출과 관련하여 가장 많이 문의하시는 내용입니다.
          </p>
        </div>

        {/* 아코디언 리스트 */}
        <div className="space-y-4 mb-16">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <span className="font-bold text-white text-sm sm:text-base flex items-center gap-3">
                    <span className="text-cyan-400 font-mono font-extrabold">Q.</span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800/60 bg-slate-950/40 animate-in fade-in duration-200">
                    <p className="pl-6 border-l-2 border-cyan-500/50">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 문의처 카드 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">더 궁금한 점이 있으신가요?</h4>
              <p className="text-xs text-slate-400 mt-0.5">운영사무국으로 문의해 주시면 신속하게 답변드리겠습니다.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>051-740-0000</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>contact@busan-travelthon.kr</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
