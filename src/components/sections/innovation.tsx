"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, Loader2, Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { SectionBanner } from "@/components/miao/section-banner";

const THEME_PRESETS = [
  "蝴蝶妈妈",
  "龙凤呈祥",
  "花鸟纹",
  "鱼跃龙门",
  "石榴多子",
  "八瓣花开",
];

const STYLES = [
  { id: "classic", name: "传统古朴", desc: "靛蓝朱砂，对称庄重" },
  { id: "modern", name: "现代几何", desc: "简化留白，明快清新" },
  { id: "fantasy", name: "奇幻绚丽", desc: "夸张变形，色彩梦幻" },
];

const COLOR_SCHEMES = [
  { id: "indigo", name: "靛蓝经典", colors: ["#1e3a5f", "#c1272d", "#d4a04c"] },
  { id: "vibrant", name: "浓烈多彩", colors: ["#c1272d", "#2d8659", "#f4c430"] },
  { id: "monochrome", name: "银白单色", colors: ["#1e3a5f", "#c0c0c0", "#ffffff"] },
  { id: "warm", name: "暖意盎然", colors: ["#c1272d", "#d4a04c", "#8b4513"] },
];

export function InnovationSection() {
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState("classic");
  const [colorScheme, setColorScheme] = useState("indigo");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<
    Array<{ url: string; theme: string; time: string }>
  >([]);

  const [fallback, setFallback] = useState(false);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast({
        title: "请输入纹样主题",
        description: "例如：蝴蝶妈妈、龙凤呈祥、花鸟纹",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResultUrl(null);
    setFallback(false);

    try {
      const res = await fetch("/api/pattern-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, style, colorScheme }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "生成失败");
      }

      setResultUrl(data.imageUrl);
      setFallback(!!data.fallback);
      setHistory((prev) => [
        { url: data.imageUrl, theme, time: new Date().toLocaleTimeString("zh-CN") },
        ...prev.slice(0, 5),
      ]);
      if (data.fallback) {
        toast({
          title: "已生成示例纹样",
          description: "当前为离线演示图案（未接入 AI 服务）",
        });
      } else {
        toast({
          title: "纹样生成成功",
          description: `主题：${theme}`,
        });
      }
    } catch (error) {
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="innovation" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionBanner src="/images/innovation.jpg" alt="苗绣创新氛围" caption="AI 织梦 · 古纹新生" />
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            <Sparkles size={12} />
            INNOVATION · 绣新
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary mb-4">
            AI 纹样生成器
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            融合苗绣传统纹样美学与人工智能生成技术，
            输入主题，让 AI 为你创作独一无二的苗绣风格纹样。
            这是民族文化与数字艺术的融合创新实践。
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左侧：参数配置 */}
          <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
            <h3 className="font-serif text-xl font-bold text-primary mb-6">
              创作参数
            </h3>

            {/* 主题输入 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                纹样主题
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="输入你想生成的苗绣纹样主题..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                maxLength={50}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTheme(preset)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border transition-all",
                      theme === preset
                        ? "bg-accent text-white border-accent"
                        : "border-border text-muted-foreground hover:border-accent/40"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 风格选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                艺术风格
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      style === s.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="font-serif text-sm font-medium text-primary">
                      {s.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {s.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 配色方案 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-2">
                配色方案
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_SCHEMES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColorScheme(c.id)}
                    className={cn(
                      "p-3 rounded-lg border flex items-center gap-3 transition-all",
                      colorScheme === c.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex gap-1">
                      {c.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-white/50"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 bg-accent hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  正在生成纹样...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  生成苗绣纹样
                </>
              )}
            </button>
          </div>

          {/* 右侧：生成结果 */}
          <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
            <h3 className="font-serif text-xl font-bold text-primary mb-6">
              生成结果
            </h3>

            <div className="aspect-square w-full rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center overflow-hidden relative">
              {loading ? (
                <div className="text-center">
                  <Loader2 size={40} className="animate-spin text-accent mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    AI 正在创作中...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    通常需要 10-30 秒
                  </p>
                </div>
              ) : resultUrl ? (
                <div className="relative w-full h-full">
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={resultUrl}
                    alt={`苗绣纹样 - ${theme}`}
                    className="w-full h-full object-cover"
                  />
                  {fallback && (
                    <span className="absolute top-3 left-3 px-2 py-1 text-[10px] rounded-full bg-primary/85 text-primary-foreground backdrop-blur-sm">
                      离线示例图案
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-center px-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                    <Sparkles size={28} className="text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    等待你的创作
                  </p>
                  <p className="text-xs text-muted-foreground">
                    输入主题，点击生成
                  </p>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            {resultUrl && !loading && (
              <div className="flex gap-2 mt-4">
                <a
                  href={resultUrl}
                  download={`miao-pattern-${Date.now()}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  下载
                </a>
                <button
                  onClick={handleGenerate}
                  className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  重新生成
                </button>
              </div>
            )}

            {/* 历史记录 */}
            {history.length > 0 && (
              <div className="mt-6">
                <div className="text-xs text-muted-foreground mb-2">
                  历史创作
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setResultUrl(h.url)}
                      className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-accent transition-colors"
                      title={`${h.theme} - ${h.time}`}
                    >
                      <img
                        src={h.url}
                        alt={h.theme}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 创新说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid md:grid-cols-3 gap-4"
        >
          {[
            {
              title: "传统纹样学习",
              desc: "AI 模型学习数千种苗绣传统纹样的构图、配色与寓意，理解其美学规律。",
            },
            {
              title: "智能生成创新",
              desc: "基于输入主题，AI 在传统美学框架内生成新纹样，既保留苗绣神韵，又具现代创意。",
            },
            {
              title: "文化传承赋能",
              desc: "生成的纹样可用于文创设计、数字艺术、时尚产品，让苗绣融入当代生活。",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-5 bg-background rounded-xl border border-border"
            >
              <div className="font-serif font-bold text-primary mb-2">
                {item.title}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
