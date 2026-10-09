"use client";

import { motion } from "framer-motion";
import { Layers, Search, GitBranch, Boxes } from "lucide-react";
import { PATTERNS } from "@/data/miao";
import { SectionBanner } from "@/components/miao/section-banner";
import { CreationPageShell } from "@/components/miao/creation-page-shell";

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`难度 ${level}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`w-1.5 h-1.5 rounded-full ${
            n <= level ? "bg-accent" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

const CATEGORY_STYLE: Record<string, string> = {
  图腾: "bg-primary/10 text-primary",
  自然: "bg-accent/10 text-accent",
  几何: "bg-gold/15 text-gold",
  叙事: "bg-primary/10 text-primary",
};

const STATS = [
  { icon: Layers, value: "200+", label: "矢量纹样", note: "已完成数字化采集（项目规划数据）" },
  { icon: GitBranch, value: "6 大", label: "纹样系谱", note: "图腾·自然·几何·叙事等分类" },
  { icon: Search, value: "12 维", label: "检索维度", note: "纹样名·寓意·地区·针法·难度" },
  { icon: Boxes, value: "∞", label: "参数化生成", note: "支持按比例/配色衍生" },
];

export function PatternLibraryContent() {
  return (
    <CreationPageShell slug="pattern-library">
      <SectionBanner
        src="/images/patterns.jpg"
        alt="苗绣纹样图谱"
        caption="纹以载道 · 数化新生"
      />

      {/* 核心纹样 */}
      <section className="py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            核心纹样 · PATTERN ATLAS
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-primary mb-4">
            八色古纹，皆可检索
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            每一道纹样都被矢量化、参数化，记录其寓意、流传地区与刺绣难度，
            成为可检索、可生成的数字资产。
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PATTERNS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className="group bg-card rounded-2xl border border-border p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-block px-2 py-0.5 text-xs rounded ${
                    CATEGORY_STYLE[p.category] || "bg-primary/10 text-primary"
                  }`}
                >
                  {p.category}
                </span>
                <span className="text-xs text-muted-foreground font-serif">
                  {p.nameEn}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-primary mb-2">
                {p.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                {p.meaning}
              </p>
              <div className="space-y-2 pt-4 border-t border-border text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">流传地区</span>
                  <span className="text-foreground/80">{p.region}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">刺绣难度</span>
                  <DifficultyDots level={p.difficulty} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 能力指标 */}
      <section className="py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="rounded-2xl border border-border bg-card p-8 lg:p-12"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            能力指标 · CAPABILITIES
          </div>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-primary mb-8">
            纹样库的数字底座
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <s.icon size={22} />
                </div>
                <div className="font-serif text-3xl font-bold text-primary">
                  {s.value}
                </div>
                <div className="text-sm font-medium text-foreground/80 mt-1">
                  {s.label}
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {s.note}
                </p>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/70 mt-8 pt-6 border-t border-border">
            * 上述数量为项目规划数据，实际建设工作持续进行中。
          </p>
        </motion.div>
      </section>
    </CreationPageShell>
  );
}
