"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Palette, Shirt, BookOpen, Home } from "lucide-react";
import { CREATIONS } from "@/data/miao";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  数字资产: Palette,
  时尚设计: Shirt,
  数字出版: BookOpen,
  文创产品: Home,
};

export function CreationSection() {
  return (
    <section id="creation" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            CREATION · 绣创
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary mb-4">
            古纹新生，创意无限
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            苗绣不止于博物馆的陈列，更应融入当代生活。
            从数字资产到时尚设计，从数字出版到文创产品，
            让千年苗绣在创新中焕发新生。
          </p>
        </motion.div>

        {/* 文创卡片 */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {CREATIONS.map((item, i) => {
            const Icon = CATEGORY_ICONS[item.category] || Palette;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* 左侧视觉 */}
                  <div className="sm:w-2/5 aspect-square sm:aspect-auto bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <g fill="currentColor">
                          <circle cx="50" cy="50" r="3" />
                          <circle cx="20" cy="20" r="2" />
                          <circle cx="80" cy="20" r="2" />
                          <circle cx="20" cy="80" r="2" />
                          <circle cx="80" cy="80" r="2" />
                          <path
                            d="M50 20 L 50 80 M 20 50 L 80 50"
                            stroke="currentColor"
                            strokeWidth="0.5"
                          />
                        </g>
                      </svg>
                    </div>
                    <Icon
                      size={48}
                      className="text-primary/60 group-hover:scale-110 transition-transform"
                    />
                  </div>

                  {/* 右侧内容 */}
                  <div className="sm:w-3/5 p-6 lg:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                          {item.category}
                        </span>
                        <ArrowUpRight
                          size={18}
                          className="text-muted-foreground group-hover:text-accent group-hover:rotate-45 transition-all"
                        />
                      </div>
                      <h3 className="font-serif text-xl lg:text-2xl font-bold text-primary mb-3">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-muted-foreground flex-shrink-0">
                          设计方
                        </span>
                        <span className="text-foreground/80">
                          {item.designer}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-muted-foreground flex-shrink-0">
                          创新点
                        </span>
                        <span className="text-accent font-medium">
                          {item.innovation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 项目立意 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 lg:p-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl text-primary-foreground relative overflow-hidden"
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
          <div className="relative z-10 max-w-3xl">
            <div className="text-xs tracking-widest text-primary-foreground/60 mb-3">
              项目立意 · PROJECT VISION
            </div>
            <h3 className="font-serif text-2xl lg:text-3xl font-bold mb-4 leading-tight">
              铸牢中华民族共同体意识，
              <br />
              推动民族优秀文化创新表达
            </h3>
            <p className="text-primary-foreground/80 leading-relaxed text-sm lg:text-base">
              本项目以苗绣为切入点，运用智能科技与数字创意，
              构建集文化展示、互动体验、AI 创作于一体的数字文化平台。
              通过纹样图谱数字化、虚拟刺绣体验、AI 纹样生成等创新形式，
              让千年苗绣在数字时代焕发新生，推动民族文化的创新性传承与发展，
              铸牢中华民族共同体意识。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
