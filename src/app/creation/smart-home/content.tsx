"use client";

import { motion } from "framer-motion";
import { Home, Lightbulb, Sofa, PanelTop, Droplets, Cpu, Sparkles, Wind } from "lucide-react";
import { SectionBanner } from "@/components/miao/section-banner";
import { CreationPageShell } from "@/components/miao/creation-page-shell";

const PRODUCTS = [
  {
    icon: Lightbulb,
    name: "刺绣氛围灯",
    pattern: "太阳纹 · 螺旋纹",
    interaction: "感应亮灯 · 色温随心境联动",
    desc: "灯罩以苗绣纹样透光，人近即亮，暖光如苗乡晨曦，让纹样在夜里静静呼吸。",
  },
  {
    icon: Sofa,
    name: "纹样抱枕",
    pattern: "花卉纹 · 鸟纹",
    interaction: "语音呼唤 · 讲述纹样寓意",
    desc: "抱枕藏于绣面之下的芯片，轻唤即可讲出花鸟的故事，把文化绣进客厅。",
  },
  {
    icon: PanelTop,
    name: "智能屏风",
    pattern: "龙纹 · 回纹边饰",
    interaction: "氛围联动 · 随影随乐变幻",
    desc: "屏风以绣面为屏，连接家居中枢，光影随音乐与时刻流转，围合一方静谧。",
  },
  {
    icon: Droplets,
    name: "香薰加湿器",
    pattern: "鱼纹 · 螺旋纹",
    interaction: "感应喷雾 · 雾随纹样舒展",
    desc: "雾气自鱼纹中升腾，循环如生命不息，在呼吸间安放一段苗乡静好。",
  },
];

const PRINCIPLES = [
  { icon: Cpu, title: "非遗为魂", desc: "以真实纹样与针法为设计母题，拒绝符号化挪用。" },
  { icon: Sparkles, title: "智能为用", desc: "感应、语音、联动等交互自然融入，不喧宾夺主。" },
  { icon: Wind, title: "生活为场", desc: "让千年苗绣回到日常起居，于使用中完成传承。" },
];

export function SmartHomeContent() {
  return (
    <CreationPageShell slug="smart-home">
      <SectionBanner
        src="/images/creation.jpg"
        alt="苗绣智能家居"
        caption="非遗入户 · 智享生活"
      />

      {/* 产品矩阵 */}
      <section className="py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            产品矩阵 · PRODUCTS
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-primary mb-4">
            把苗绣，请回家里
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            四件家居产品，将纹样之美与智能之便相织，
            让传统文化在起居之间无声陪伴。
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
              className="group bg-card rounded-2xl border border-border p-6 lg:p-8 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary">
                  <p.icon size={20} />
                </span>
                <Home size={18} className="text-primary/50 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-serif text-xl lg:text-2xl font-bold text-primary mb-2">
                {p.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {p.desc}
              </p>
              <div className="space-y-2 pt-4 border-t border-border text-xs">
                <div className="flex items-start gap-2">
                  <Sparkles size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground flex-shrink-0">纹样应用</span>
                  <span className="text-foreground/80">{p.pattern}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Cpu size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground flex-shrink-0">智能交互</span>
                  <span className="text-foreground/80">{p.interaction}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 非遗 + 智能 理念 */}
      <section className="py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 p-8 lg:p-12 text-primary-foreground relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <g fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="100" cy="100" r="80" />
                <circle cx="100" cy="100" r="60" />
                <circle cx="100" cy="100" r="40" />
                <circle cx="100" cy="100" r="20" />
              </g>
            </svg>
          </div>
          <div className="relative z-10">
            <div className="text-xs tracking-widest text-primary-foreground/60 mb-3">
              非遗 + 智能 · PHILOSOPHY
            </div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold mb-8 leading-tight">
              让针线里的智慧，住进当代生活
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {PRINCIPLES.map((pr, i) => (
                <motion.div
                  key={pr.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/15 text-primary-foreground mb-4">
                    <pr.icon size={22} />
                  </div>
                  <div className="font-serif text-lg font-bold mb-1">{pr.title}</div>
                  <p className="text-sm text-primary-foreground/80 leading-relaxed">
                    {pr.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </CreationPageShell>
  );
}
