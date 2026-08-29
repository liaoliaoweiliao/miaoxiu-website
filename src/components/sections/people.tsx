"use client";

import { motion } from "framer-motion";
import { Quote, Award, MapPin } from "lucide-react";
import { INHERITORS } from "@/data/miao";
import { cn } from "@/lib/utils";

const LEVEL_STYLES: Record<string, string> = {
  国家级: "bg-accent/10 text-accent border-accent/30",
  省级: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  市级: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
};

export function PeopleSection() {
  return (
    <section id="people" className="py-20 lg:py-32 bg-background pattern-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            PEOPLE · 绣人
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary mb-4">
            守艺之人，薪火相传
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            一代代苗绣传承人，以针为笔、以线为墨，
            将千年技艺与民族记忆，绣进每一寸布帛。
            她们是文化的守护者，也是创新的开拓者。
          </p>
        </motion.div>

        {/* 传承人卡片 */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {INHERITORS.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all"
            >
              {/* 顶部装饰 */}
              <div className="h-32 bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 200 100" className="w-full h-full">
                    <pattern
                      id={`pattern-${i}`}
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="10" cy="10" r="2" fill="currentColor" />
                    </pattern>
                    <rect width="200" height="100" fill={`url(#pattern-${i})`} />
                  </svg>
                </div>
                {/* 头像占位 */}
                <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent border-4 border-background flex items-center justify-center text-white font-serif text-2xl font-bold shadow-lg">
                  {person.name.charAt(0)}
                </div>
                <div
                  className={cn(
                    "absolute top-4 right-4 px-2 py-1 text-xs rounded-full border backdrop-blur-sm",
                    LEVEL_STYLES[person.level]
                  )}
                >
                  {person.level}
                </div>
              </div>

              {/* 内容 */}
              <div className="pt-12 pb-6 px-6">
                <h3 className="font-serif text-xl font-bold text-primary mb-1">
                  {person.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {person.title}
                </p>

                <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    {person.region}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award size={12} />
                    从艺 {person.years} 年
                  </div>
                </div>

                <div className="inline-block px-2 py-0.5 mb-3 text-xs bg-accent/10 text-accent rounded">
                  擅长：{person.specialty}
                </div>

                <div className="relative">
                  <Quote
                    size={16}
                    className="absolute -top-1 -left-1 text-accent/30"
                  />
                  <p className="text-sm text-foreground/80 leading-relaxed pl-5 italic">
                    {person.story}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 数据统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { num: "130+", label: "国家级传承人" },
            { num: "500+", label: "省级传承人" },
            { num: "1000+", label: "市县级传承人" },
            { num: "30万", label: "从业绣娘" },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 bg-muted/30 rounded-xl border border-border/50"
            >
              <div className="font-serif text-3xl lg:text-4xl font-bold text-accent mb-1">
                {stat.num}
              </div>
              <div className="text-xs text-muted-foreground tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
