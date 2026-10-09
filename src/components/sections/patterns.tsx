"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, MapPin, Gauge } from "lucide-react";
import { PATTERNS } from "@/data/miao";
import {
  MIAO_PATTERNS,
  type PatternKey,
} from "@/components/miao/patterns";
import { cn } from "@/lib/utils";
import { SectionBanner } from "@/components/miao/section-banner";

const CATEGORY_LABELS: Record<string, string> = {
  图腾: "图腾纹样",
  自然: "自然纹样",
  几何: "几何纹样",
  叙事: "叙事纹样",
};

const CATEGORY_COLORS: Record<string, string> = {
  图腾: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  自然: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  几何: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  叙事: "bg-purple-500/15 text-purple-700 border-purple-500/30",
};

export function PatternSection() {
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [selectedPattern, setSelectedPattern] = useState<
    (typeof PATTERNS)[0] | null
  >(null);

  const categories = ["全部", ...Object.keys(CATEGORY_LABELS)];
  const filtered =
    activeCategory === "全部"
      ? PATTERNS
      : PATTERNS.filter((p) => p.category === activeCategory);

  return (
    <section id="patterns" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionBanner src="/images/patterns.jpg" alt="苗绣纹样氛围" caption="蝴蝶妈妈 · 万纹之源" />
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            PATTERNS · 绣纹
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary mb-4">
            纹样图谱，寓意万千
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            每一个纹样都是一段故事、一种信仰、一份祈愿。
            点击纹样卡片，解读其背后的文化密码与传承故事。
          </p>
        </motion.div>

        {/* 分类筛选 */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background border border-border text-foreground/70 hover:border-primary/30"
              )}
            >
              {cat === "全部" ? "全部" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* 纹样网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map((pattern, i) => {
            const PatternComp =
              MIAO_PATTERNS[pattern.patternKey as PatternKey] ||
              MIAO_PATTERNS.butterfly;
            return (
              <motion.button
                key={pattern.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                onClick={() => setSelectedPattern(pattern)}
                className="group relative p-4 lg:p-6 bg-background rounded-xl border border-border hover:border-accent/40 hover:shadow-lg transition-all text-left"
              >
                {/* 纹样展示 */}
                <div className="aspect-square mb-4 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-4 group-hover:scale-105 transition-transform">
                  <PatternComp className="w-full h-full" />
                </div>

                {/* 分类标签 */}
                <div
                  className={cn(
                    "inline-block px-2 py-0.5 mb-2 text-xs rounded border",
                    CATEGORY_COLORS[pattern.category]
                  )}
                >
                  {pattern.category}
                </div>

                <h3 className="font-serif text-lg font-semibold text-primary mb-1">
                  {pattern.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {pattern.meaning}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedPattern && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPattern(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl"
            >
              <button
                onClick={() => setSelectedPattern(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
                aria-label="关闭"
              >
                <X size={20} />
              </button>

              <div className="grid sm:grid-cols-2 gap-0">
                {/* 左侧纹样 */}
                <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-8">
                  {(() => {
                    const PatternComp =
                      MIAO_PATTERNS[
                        selectedPattern.patternKey as PatternKey
                      ] || MIAO_PATTERNS.butterfly;
                    return <PatternComp className="w-full h-full" />;
                  })()}
                </div>

                {/* 右侧详情 */}
                <div className="p-6 lg:p-8">
                  <div
                    className={cn(
                      "inline-block px-2 py-0.5 mb-3 text-xs rounded border",
                      CATEGORY_COLORS[selectedPattern.category]
                    )}
                  >
                    {selectedPattern.category}
                  </div>

                  <h3 className="font-serif text-3xl font-bold text-primary mb-1">
                    {selectedPattern.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 tracking-wide">
                    {selectedPattern.nameEn}
                  </p>

                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        寓意
                      </div>
                      <p className="text-foreground leading-relaxed">
                        {selectedPattern.meaning}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        文化故事
                      </div>
                      <p className="text-foreground/80 leading-relaxed">
                        {selectedPattern.story}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin size={14} />
                        {selectedPattern.region}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Gauge size={14} />
                        难度 {selectedPattern.difficulty}/5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
