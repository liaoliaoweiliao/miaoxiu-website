"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { CREATIONS } from "@/data/miao";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { ScrollProgress, BackToTop } from "@/components/sections/scroll-ui";

interface CreationPageShellProps {
  /** 当前页面 slug，用于在「探索其他绣创项目」中排除自身 */
  slug: string;
  children: React.ReactNode;
}

/**
 * 绣创子页面共享骨架：
 * 面包屑 + 返回首页、页头（category 徽标 / 大标题 / 描述 / 设计方·创新点）、
 * framer-motion 入场动画、以及底部兄弟页面互通区块。
 * 页头数据自动从 CREATIONS 中按 slug 读取，保证与首页卡片一致。
 */
export function CreationPageShell({ slug, children }: CreationPageShellProps) {
  const item = CREATIONS.find((c) => c.slug === slug);
  const siblings = CREATIONS.filter((c) => c.slug !== slug);

  if (!item) {
    return <div className="max-w-7xl mx-auto px-4 py-24">{children}</div>;
  }

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="min-h-screen bg-background">
      {/* 页头 */}
      <section className="pt-24 lg:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 面包屑 + 返回首页 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <ArrowLeft size={16} />
              返回首页
            </Link>
            <span className="mx-2 text-muted-foreground/40">/</span>
            <span className="text-sm text-foreground/70">绣·创</span>
            <span className="mx-2 text-muted-foreground/40">/</span>
            <span className="text-sm text-primary font-medium">
              {item.name}
            </span>
          </motion.div>

          {/* 标题区 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <span className="inline-block px-2 py-0.5 mb-4 text-xs bg-primary/10 text-primary rounded">
              {item.category}
            </span>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-primary mb-4 leading-tight">
              {item.name}
            </h1>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              {item.description}
            </p>

            {/* 设计方 / 创新点 信息行（与首页卡片底部一致） */}
            <div className="mt-6 flex flex-col sm:flex-row gap-x-10 gap-y-2 pt-4 border-t border-border max-w-2xl">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground flex-shrink-0">设计方</span>
                <span className="text-foreground/80">{item.designer}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground flex-shrink-0">创新点</span>
                <span className="text-accent font-medium">{item.innovation}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 页面主体 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {children}
      </div>

      {/* 探索其他绣创项目 */}
      <section className="bg-muted/30 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-10"
          >
            <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
              探索其他绣创项目
            </div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-primary">
              古纹新生，创意无限
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {siblings.map((sib, i) => (
              <motion.div
                key={sib.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/creation/${sib.slug}`}
                  className="group block h-full bg-card rounded-2xl border border-border p-6 lg:p-8 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                      {sib.category}
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-muted-foreground group-hover:text-accent group-hover:rotate-45 transition-all"
                    />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-primary mb-2">
                    {sib.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {sib.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
