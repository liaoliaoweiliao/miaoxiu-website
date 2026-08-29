"use client";

import { ButterflyMotherPattern } from "@/components/miao/patterns";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* 顶部纹样装饰 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-gold to-accent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* 品牌 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10">
                <ButterflyMotherPattern
                  className="w-full h-full"
                  colors={["#ffffff", "#ffffff", "#d4a04c"]}
                />
              </div>
              <div>
                <div className="font-serif text-xl font-bold">
                  苗绣·生生不息
                </div>
                <div className="text-xs text-primary-foreground/60 tracking-wider">
                  MIAO EMBROIDERY · ENDLESS VITALITY
                </div>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-md">
              以智能科技与数字创意，让千年苗绣在数字时代焕发新生。
              本项目为"民族文化 创新表达"专项赛道参赛作品，
              致力于推动民族优秀文化的创新性传承与发展。
            </p>
          </div>

          {/* 快速导航 */}
          <div>
            <h4 className="font-serif font-bold mb-4 text-sm tracking-wider">
              快速导航
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {[
                { id: "history", label: "绣·史" },
                { id: "patterns", label: "绣·纹" },
                { id: "craft", label: "绣·艺" },
                { id: "innovation", label: "绣·新" },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) {
                        const top =
                          el.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top, behavior: "smooth" });
                      }
                    }}
                    className="hover:text-accent transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* 赛道信息 */}
          <div>
            <h4 className="font-serif font-bold mb-4 text-sm tracking-wider">
              参赛信息
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>第十二届全国大学生数字媒体科技作品及创意竞赛</li>
              <li>"民族文化 创新表达"专项赛道</li>
              <li className="pt-2 text-xs text-primary-foreground/50">
                指导思想：铸牢中华民族共同体意识
              </li>
            </ul>
          </div>
        </div>

        {/* 底部 */}
        <div className="mt-12 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <div>© 2025 苗绣·生生不息 · 数字文化创新表达平台</div>
          <div className="flex items-center gap-4">
            <span>非遗保护 · 文化传承 · 创新表达</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
