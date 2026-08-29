"use client";

import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import {
  ButterflyMotherPattern,
  DragonPattern,
  BirdPattern,
  FlowerPattern,
  SunPattern,
  SpiralPattern,
} from "@/components/miao/patterns";

export function HeroSection() {
  const scrollToNext = () => {
    const el = document.getElementById("history");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden indigo-gradient"
    >
      {/* 背景纹样装饰 */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 spin-slow">
          <ButterflyMotherPattern className="w-full h-full" colors={["#ffffff", "#ffffff", "#ffffff"]} />
        </div>
        <div className="absolute top-[20%] right-[8%] w-48 h-48 float-slow">
          <DragonPattern className="w-full h-full" colors={["#ffffff", "#ffffff", "#ffffff"]} />
        </div>
        <div className="absolute bottom-[15%] left-[12%] w-40 h-40 float-slow" style={{ animationDelay: "2s" }}>
          <BirdPattern className="w-full h-full" colors={["#ffffff", "#ffffff", "#ffffff"]} />
        </div>
        <div className="absolute bottom-[20%] right-[15%] w-56 h-56 spin-slow" style={{ animationDirection: "reverse" }}>
          <FlowerPattern className="w-full h-full" colors={["#ffffff", "#ffffff", "#ffffff"]} />
        </div>
        <div className="absolute top-[50%] left-[3%] w-32 h-32 float-slow" style={{ animationDelay: "1s" }}>
          <SunPattern className="w-full h-full" colors={["#ffffff", "#ffffff", "#ffffff"]} />
        </div>
        <div className="absolute top-[60%] right-[5%] w-36 h-36 spin-slow" style={{ animationDuration: "40s" }}>
          <SpiralPattern className="w-full h-full" colors={["#ffffff", "#ffffff", "#ffffff"]} />
        </div>
      </div>

      {/* 渐变光晕 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30 pointer-events-none" />

      {/* 主内容 */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
        >
          <Sparkles size={14} className="text-amber-300" />
          <span className="text-xs sm:text-sm text-white/80 tracking-wider">
            民族文化 · 创新表达 · 数字传承
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 silver-text leading-tight"
        >
          苗绣·生生不息
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg sm:text-xl text-white/70 mb-4 font-light tracking-wide"
        >
          以针为笔，以线为墨，绣一部穿在身上的史诗
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-sm sm:text-base text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          千年苗绣，国家级非物质文化遗产。本平台以智能科技与数字创意，
          让苗族纹样图谱、绣艺技法、传承故事在数字时代焕发新生，
          铸牢中华民族共同体意识。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={scrollToNext}
            className="group px-8 py-3.5 bg-accent hover:bg-accent/90 text-white font-medium rounded-md transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <span className="font-serif tracking-wide">开启绣卷</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("innovation");
              if (el) {
                const top = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: "smooth" });
              }
            }}
            className="px-8 py-3.5 border border-white/30 hover:border-white/60 text-white/90 hover:text-white font-medium rounded-md transition-all backdrop-blur-sm hover:bg-white/5"
          >
            <span className="font-serif tracking-wide">AI 纹样生成</span>
          </button>
        </motion.div>

        {/* 数据统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mt-16 pt-8 border-t border-white/10"
        >
          {[
            { num: "千年", label: "文化传承" },
            { num: "100+", label: "纹样图谱" },
            { num: "6", label: "支系流派" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-serif text-2xl sm:text-3xl font-bold text-white mb-1">
                {stat.num}
              </div>
              <div className="text-xs sm:text-sm text-white/50 tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* 滚动提示 */}
      <motion.button
        onClick={scrollToNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
        aria-label="向下滚动"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={28} />
        </motion.div>
      </motion.button>
    </section>
  );
}
