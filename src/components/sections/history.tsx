"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { HISTORY_TIMELINE, MIAO_BRANCHES } from "@/data/miao";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  起源: "bg-amber-500",
  发展: "bg-blue-500",
  鼎盛: "bg-purple-500",
  传承: "bg-emerald-500",
  保护: "bg-red-500",
};

export function HistorySection() {
  const [activeBranch, setActiveBranch] = useState<number | null>(null);

  return (
    <section id="history" className="py-20 lg:py-32 bg-background pattern-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            HISTORY · 绣史
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary mb-4">
            穿在身上的史诗
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            苗族无文字，以绣为史。一针一线记录迁徙、信仰与生活，
            苗绣是一部用丝线绣成的民族史诗，承载着苗族千年的文化记忆。
          </p>
        </motion.div>

        {/* 时间轴 */}
        <div className="relative mb-24">
          {/* 中线 */}
          <div className="absolute left-4 lg:left-1/2 lg:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-accent/30 to-primary/30" />

          <div className="space-y-12 lg:space-y-16">
            {HISTORY_TIMELINE.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={cn(
                  "relative flex items-start gap-6 lg:gap-0",
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                )}
              >
                {/* 时间点 */}
                <div className="absolute left-4 lg:left-1/2 lg:-translate-x-1/2 -translate-x-1/2 z-10">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full ring-4 ring-background",
                      TYPE_COLORS[event.type]
                    )}
                  />
                </div>

                {/* 内容卡片 */}
                <div className="flex-1 pl-12 lg:pl-0 lg:w-1/2">
                  <div
                    className={cn(
                      "lg:px-8",
                      i % 2 === 0 ? "lg:text-right lg:pr-12" : "lg:pl-12"
                    )}
                  >
                    <div
                      className={cn(
                        "inline-block px-2 py-0.5 mb-2 text-xs rounded text-white",
                        TYPE_COLORS[event.type]
                      )}
                    >
                      {event.type}
                    </div>
                    <div className="font-serif text-2xl font-bold text-accent mb-1">
                      {event.year}
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-primary mb-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* 占位 */}
                <div className="hidden lg:block lg:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 支系分布地图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            BRANCHES · 支系
          </div>
          <h3 className="font-serif text-3xl lg:text-4xl font-bold text-primary mb-3">
            六大支系，一绣千面
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            苗族支系众多，各支系苗绣风格迥异。点击地图标记，探索各支系的独特技艺与纹样特征。
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* 地图 */}
          <div className="lg:col-span-3 relative">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-border overflow-hidden">
              {/* 简化的中国西南地图轮廓 */}
              <svg
                viewBox="0 0 100 75"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* 地形示意 */}
                <path
                  d="M20 20 Q 30 15, 45 18 Q 60 15, 75 20 Q 85 30, 82 45 Q 78 58, 65 65 Q 50 70, 35 65 Q 22 60, 18 45 Q 15 30, 20 20 Z"
                  fill="oklch(0.32 0.08 250 / 0.08)"
                  stroke="oklch(0.32 0.08 250 / 0.3)"
                  strokeWidth="0.3"
                />
                {/* 省界示意线 */}
                <path
                  d="M45 18 Q 50 30, 48 45 M 60 15 Q 58 35, 62 55"
                  stroke="oklch(0.32 0.08 250 / 0.15)"
                  strokeWidth="0.2"
                  strokeDasharray="0.5 0.5"
                  fill="none"
                />

                {/* 支系标记 */}
                {MIAO_BRANCHES.map((branch, i) => (
                  <g
                    key={i}
                    onClick={() => setActiveBranch(activeBranch === i ? null : i)}
                    className="cursor-pointer"
                  >
                    {/* 光环 */}
                    {activeBranch === i && (
                      <circle
                        cx={branch.x}
                        cy={branch.y}
                        r="6"
                        fill="oklch(0.55 0.18 28 / 0.2)"
                        className="animate-ping"
                      />
                    )}
                    {/* 标记点 */}
                    <circle
                      cx={branch.x}
                      cy={branch.y}
                      r={activeBranch === i ? "2.5" : "1.8"}
                      fill={activeBranch === i ? "oklch(0.55 0.18 28)" : "oklch(0.32 0.08 250)"}
                      stroke="white"
                      strokeWidth="0.4"
                      className="transition-all"
                    />
                    {/* 标签 */}
                    <text
                      x={branch.x}
                      y={branch.y - 3}
                      textAnchor="middle"
                      fontSize="2.5"
                      fill={activeBranch === i ? "oklch(0.55 0.18 28)" : "oklch(0.32 0.08 250)"}
                      className="font-serif font-medium pointer-events-none select-none"
                    >
                      {branch.name}
                    </text>
                  </g>
                ))}
              </svg>

              {/* 图例 */}
              <div className="absolute bottom-3 left-3 px-3 py-2 bg-background/90 backdrop-blur-sm rounded-lg border border-border text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">苗绣支系分布</span>
                </div>
              </div>
            </div>
          </div>

          {/* 支系详情 */}
          <div className="lg:col-span-2 space-y-3">
            {MIAO_BRANCHES.map((branch, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveBranch(activeBranch === i ? null : i)}
                whileHover={{ x: 4 }}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all",
                  activeBranch === i
                    ? "border-accent bg-accent/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-serif font-semibold text-primary">
                    {branch.name}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {branch.region}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {branch.feature}
                </p>
                <div className="mt-2 inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {branch.technique}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
