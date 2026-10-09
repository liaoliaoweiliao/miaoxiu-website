"use client";

import { motion } from "framer-motion";
import { BookOpen, ScanLine, Play, GraduationCap, MousePointerClick } from "lucide-react";
import { PATTERNS } from "@/data/miao";
import { SectionBanner } from "@/components/miao/section-banner";
import { CreationPageShell } from "@/components/miao/creation-page-shell";

// 取 PATTERNS 中的故事，组合为四个绘本篇章
const CHAPTERS = [
  {
    title: "蝴蝶妈妈创世篇",
    pattern: "蝴蝶妈妈",
    interaction: "扫描触发动画 · 语音解读",
    storyId: "butterfly-mother",
  },
  {
    title: "龙鱼同源篇",
    pattern: "龙纹 · 鱼纹",
    interaction: "扫描触发动画 · 涂色互动",
    storyId: "dragon",
  },
  {
    title: "太阳祭祀篇",
    pattern: "太阳纹",
    interaction: "扫描触发动画 · 语音解读",
    storyId: "sun",
  },
  {
    title: "花卉节庆篇",
    pattern: "花卉纹",
    interaction: "扫描触发动画 · 涂色互动",
    storyId: "flower",
  },
];

const STEPS = [
  { icon: ScanLine, title: "扫描绣品", desc: "用设备对准苗绣纹样，识别即刻启动。" },
  { icon: Play, title: "AR 动画呈现", desc: "纹样在眼前「活」起来，演绎其神话与寓意。" },
  { icon: GraduationCap, title: "文化课堂", desc: "配套语音与图文，带孩子读懂针线里的故事。" },
];

function storyOf(id: string) {
  return PATTERNS.find((p) => p.id === id)?.story ?? "";
}

export function ArPicturebookContent() {
  return (
    <CreationPageShell slug="ar-picturebook">
      <SectionBanner
        src="/images/creation.jpg"
        alt="苗绣 AR 互动绘本"
        caption="绣里乾坤 · 触手可及"
      />

      {/* 绘本篇章 */}
      <section className="py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            绘本篇章 · CHAPTERS
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-primary mb-4">
            一针一线，皆是故事
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            以苗绣纹样的古老叙事为蓝本，化作可扫描、可互动的绘本篇章，
            让儿童与青少年在游戏中亲近非遗。
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {CHAPTERS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
              className="group bg-card rounded-2xl border border-border p-6 lg:p-8 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  第 {i + 1} 章
                </span>
                <BookOpen size={20} className="text-primary/60 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-serif text-xl lg:text-2xl font-bold text-primary mb-2">
                {c.title}
              </h3>
              <div className="text-xs text-accent mb-3">对应纹样 · {c.pattern}</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">
                {storyOf(c.storyId)}
              </p>
              <div className="flex items-center gap-2 pt-4 border-t border-border text-xs">
                <MousePointerClick size={14} className="text-accent flex-shrink-0" />
                <span className="text-muted-foreground">互动方式</span>
                <span className="text-foreground/80">{c.interaction}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 使用流程 */}
      <section className="py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="rounded-2xl border border-border bg-card p-8 lg:p-12"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            使用流程 · HOW TO READ
          </div>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-primary mb-8">
            三步开启苗绣之旅
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <s.icon size={24} />
                </div>
                <div className="font-serif text-lg font-bold text-primary">
                  {s.title}
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </CreationPageShell>
  );
}
