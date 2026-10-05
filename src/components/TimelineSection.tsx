'use client';

import React from 'react';
import {
  Trophy,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  BadgeCheck,
} from 'lucide-react';
import { PRIZE_LIST, SCHEDULE_STEPS } from '@/lib/constants';

export default function TimelineSection() {
  return (
    <section id="timeline" className="py-24 relative bg-slate-900/40 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 시상 내역 헤더 */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold tracking-wider uppercase mb-3 border border-amber-500/20">
            <Trophy className="w-3.5 h-3.5" />
            <span>시상 및 수상 혜택</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            총 상금 3,000만원 & 창업 육성 특전
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            단순 상금 수여를 넘어, 여러분의 우수한 아이디어가 실제 부산의 관광 상품과 스타트업으로 도약할 수 있도록 전폭 지원합니다.
          </p>
        </div>

        {/* 시상 내역 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {PRIZE_LIST.map((prize, idx) => {
            const isGrand = idx === 0;
            return (
              <div
                key={prize.rank}
                className={`p-6 rounded-3xl transition-all relative flex flex-col justify-between ${
                  isGrand
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/50 shadow-xl shadow-amber-950/30 lg:-translate-y-2'
                    : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isGrand
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {prize.badge}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{prize.count}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{prize.rank}</h3>
                  <p className="text-xs text-slate-400 mb-4">{prize.prizeName}</p>

                  <div className="mb-6">
                    <span
                      className={`text-2xl sm:text-3xl font-black ${
                        isGrand ? 'text-amber-400' : 'text-cyan-400'
                      }`}
                    >
                      {prize.reward}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800/80 mb-6">
                    {prize.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* 대회 진행 일정 (타임라인) */}
        <div className="pt-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-3 border border-cyan-500/20">
              <Calendar className="w-3.5 h-3.5" />
              <span>진행 로드맵</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              대회 진행 상세 일정
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              서류 접수부터 본선 트래블톤, 최종 시상식까지의 핵심 일정입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {SCHEDULE_STEPS.map((step, idx) => (
              <div
                key={step.step}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  step.status === 'current'
                    ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-black text-cyan-400">
                      STEP {step.step}
                    </span>
                    {step.status === 'current' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                        접수 진행 중
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white mb-1.5">{step.phase}</h4>
                  <div className="text-xs font-semibold text-cyan-400 mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{step.date}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 심사 기준 인포박스 */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3">
            <span className="text-xs text-slate-400 block mb-1">창의성 및 독창성</span>
            <span className="text-2xl font-black text-cyan-400">30%</span>
            <p className="text-[11px] text-slate-500 mt-1">기존 관광과의 차별성 및 참신성</p>
          </div>
          <div className="p-3 border-l border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">실현 및 사업화 가능성</span>
            <span className="text-2xl font-black text-blue-400">30%</span>
            <p className="text-[11px] text-slate-500 mt-1">구체적 BM 및 기술 적용성</p>
          </div>
          <div className="p-3 border-l border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">부산 지역사회 파급력</span>
            <span className="text-2xl font-black text-teal-400">25%</span>
            <p className="text-[11px] text-slate-500 mt-1">로컬 상생 및 일자리 기여도</p>
          </div>
          <div className="p-3 border-l border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">기획서 완성도 및 열정</span>
            <span className="text-2xl font-black text-indigo-400">15%</span>
            <p className="text-[11px] text-slate-500 mt-1">논리적 구성 및 팀 역량</p>
          </div>
        </div>
      </div>
    </section>
  );
}
