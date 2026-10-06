'use client';

import React from 'react';
import {
  Sparkles,
  Compass,
  Waves,
  Leaf,
  Layers,
  Target,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import { COMPETITION_TRACKS } from '@/lib/constants';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-6 h-6 text-cyan-400" />,
  Compass: <Compass className="w-6 h-6 text-blue-400" />,
  Waves: <Waves className="w-6 h-6 text-teal-400" />,
  Leaf: <Leaf className="w-6 h-6 text-emerald-400" />,
};

export default function OverviewSection() {
  return (
    <section id="overview" className="py-24 relative bg-slate-950/80 border-t border-slate-900">
      {/* 은은한 배경 조명 */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 섹션 헤더 */}
        <div className="text-center max-w-3xl mx-auto mb-16 break-keep">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-3 border border-blue-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>대회 소개 & 비전</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 break-keep">
            부산을 새롭게 경험하는 방법, <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
              글로컬 트래블톤(Travelthon)
            </span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed break-keep">
            ‘트래블톤(Travelthon)’은 여행(Travel)과 해커톤(Hackathon)의 결합어로, 부산의 다채로운 매력과 디지털 신기술, 
            로컬 크리에이터의 감성을 융합하여 실현 가능한 미래형 관광 솔루션을 2일간 완성하는 대회입니다.
          </p>
        </div>

        {/* 3대 특징 배너 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 break-keep">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 break-keep">실전 현장형 문제 해결</h3>
            <p className="text-sm text-slate-400 leading-relaxed break-keep">
              단순한 서류 기획에 그치지 않고, 부산의 현안(외국인 동선 불균형, 야간 관광 활성화 등)을 직접 타겟팅하는 실질적 솔루션을 도출합니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-blue-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 break-keep">전문가 1:1 멘토링 데이</h3>
            <p className="text-sm text-slate-400 leading-relaxed break-keep">
              관광 스타트업 대표, ICT 개발자, 마케팅 전문가가 직접 참여하여 아이디어의 시장성 및 기술적 완성도를 빌드업해 드립니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-teal-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Rocket className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 break-keep">상금 + 후속 사업화 지원</h3>
            <p className="text-sm text-slate-400 leading-relaxed break-keep">
              총 상금 300만원과 더불어 부산관광공사 상품화 실증비 지원, 부산관광기업지원센터 입주 우선권 등의 특전이 제공됩니다.
            </p>
          </div>
        </div>

        {/* 4대 공모 분야 섹션 */}
        <div id="tracks" className="pt-6">
          <div className="text-center max-w-2xl mx-auto mb-12 break-keep">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-2 border border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>4대 핵심 공모 트랙</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-keep">
              당신의 아이디어가 펼쳐질 도전 분야
            </h3>
            <p className="text-slate-400 text-sm mt-2 break-keep">
              관심 있는 한 가지 트랙을 선택하여 참가신청서 및 아이디어 계획서를 작성해 주세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-keep">
            {COMPETITION_TRACKS.map((track) => (
              <div
                key={track.id}
                className="relative p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-cyan-950/20 group backdrop-blur-md break-keep"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                    {ICON_MAP[track.icon] || <Sparkles className="w-6 h-6 text-cyan-400" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {track.subtitle}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors break-keep">
                  {track.title}
                </h4>

                <p className="text-sm text-slate-300 leading-relaxed mb-5 break-keep">
                  {track.description}
                </p>

                {/* 태그 목록 */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                  {track.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 text-cyan-300/90 border border-slate-700/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
