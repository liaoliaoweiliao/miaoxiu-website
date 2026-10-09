"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { TECHNIQUES } from "@/data/miao";
import { cn } from "@/lib/utils";
import { SectionBanner } from "@/components/miao/section-banner";

export function CraftSection() {
  const [activeTech, setActiveTech] = useState(0);
  const [stitchCount, setStitchCount] = useState(0);
  const [stitches, setStitches] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tech = TECHNIQUES[activeTech];

  // 绘制刺绣画布
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // 背景
    ctx.fillStyle = "#f5f0e6";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 绘制底纹（轮廓）
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const r = Math.min(rect.width, rect.height) * 0.35;
    // 八瓣花轮廓
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x1 = cx + Math.cos(angle) * r * 0.5;
      const y1 = cy + Math.sin(angle) * r * 0.5;
      const x2 = cx + Math.cos(angle) * r;
      const y2 = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(
        cx + Math.cos(angle + 0.2) * r * 0.85,
        cy + Math.sin(angle + 0.2) * r * 0.85,
        x2,
        y2
      );
      ctx.quadraticCurveTo(
        cx + Math.cos(angle - 0.2) * r * 0.85,
        cy + Math.sin(angle - 0.2) * r * 0.85,
        x1,
        y1
      );
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 中心圆
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制已绣针迹
    stitches.forEach((s) => {
      ctx.strokeStyle = "#c1272d";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x - 4, s.y);
      ctx.lineTo(s.x + 4, s.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - 4);
      ctx.lineTo(s.x, s.y + 4);
      ctx.stroke();
    });
  }, [stitches, activeTech]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStitches((prev) => [...prev, { x, y }]);
    setStitchCount((c) => c + 1);
  };

  const resetCanvas = () => {
    setStitches([]);
    setStitchCount(0);
  };

  return (
    <section id="craft" className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionBanner src="/images/craft.jpg" alt="苗绣技艺氛围" caption="一针一线 · 皆是匠心" />
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            CRAFT · 绣艺
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-primary mb-4">
            一针一线，皆有法度
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            苗绣技法繁多，平绣、破线绣、锁绣、辫绣、堆绣各具特色。
            了解传统技法，亲手体验虚拟刺绣，感受针线之间的匠心。
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* 左侧：技法列表 */}
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {TECHNIQUES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTech(i)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTech === i
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-foreground/70 hover:bg-muted"
                  )}
                >
                  <span className="font-serif">{t.name}</span>
                </button>
              ))}
            </div>

            <motion.div
              key={activeTech}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-xl border border-border p-6 lg:p-8"
            >
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-serif text-2xl font-bold text-primary">
                  {tech.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {tech.nameEn}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {tech.description}
              </p>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    特点
                  </div>
                  <p className="text-sm text-foreground/80">{tech.feature}</p>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    应用
                  </div>
                  <p className="text-sm text-foreground/80">{tech.use}</p>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    难度
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-6 h-1.5 rounded-full",
                          i < tech.difficulty
                            ? "bg-accent"
                            : "bg-muted"
                        )}
                      />
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {["入门", "基础", "进阶", "熟练", "精通"][tech.difficulty - 1]}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 右侧：虚拟刺绣 */}
          <div>
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-primary">
                    虚拟刺绣体验
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    点击画布，绣下你的第一针
                  </p>
                </div>
                <button
                  onClick={resetCanvas}
                  className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-muted transition-colors"
                >
                  重新开始
                </button>
              </div>

              <div
                ref={containerRef}
                className="relative aspect-square w-full rounded-lg overflow-hidden border border-border/50 cursor-crosshair"
              >
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="absolute inset-0"
                />
                {stitchCount === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-4xl mb-2 opacity-30">🪡</div>
                      <p className="text-sm text-muted-foreground">
                        沿虚线轮廓点击绣制
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">已绣针数：</span>
                  <span className="font-serif font-bold text-accent text-lg">
                    {stitchCount}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {stitchCount === 0
                    ? "开始你的刺绣之旅"
                    : stitchCount < 20
                    ? "继续，纹样正在成形"
                    : stitchCount < 50
                    ? "绣艺渐入佳境"
                    : "你已掌握苗绣精髓"}
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <p className="text-xs text-foreground/70 leading-relaxed">
                💡 <span className="font-medium">小贴士：</span>
                真实苗绣中，绣娘需数年方能精通一种技法。
                破线绣需将一根丝线劈成8-16根细丝，方能绣出细腻光泽。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
