"use client";

import { motion } from "framer-motion";
import { Shirt, Sparkles, Scissors, Compass, Hammer, Megaphone, Palette } from "lucide-react";
import { SectionBanner } from "@/components/miao/section-banner";
import { CreationPageShell } from "@/components/miao/creation-page-shell";

const SERIES = [
  {
    name: "盛装礼赞",
    position: "高定系列",
    pattern: "蝴蝶妈妈 · 龙纹",
    craft: "破线绣 + 锁绣，真丝缎面手工钉绣",
    desc: "以苗族盛装为母题的高级定制，将始祖图腾与祥龙纹样解构重组，呈现庄重而当代的礼服语言。",
  },
  {
    name: "日常锦绣",
    position: "成衣系列",
    pattern: "花卉纹 · 回纹边饰",
    craft: "平绣 + 贴布绣，棉麻混纺日常可穿",
    desc: "把苗绣的温度缝进日常，几何边饰与花卉意象点缀通勤与休闲装，让非遗融入衣橱。",
  },
  {
    name: "山水行走",
    position: "配饰系列",
    pattern: "太阳纹 · 鸟纹",
    craft: "打籽绣 + 辫绣，皮革与织带结合",
    desc: "以背包、腰带、胸针等配饰为载体，让太阳与飞鸟的灵性伴随每一步行走。",
  },
  {
    name: "童趣苗乡",
    position: "亲子系列",
    pattern: "鱼纹 · 螺旋纹",
    craft: "挑花 + 平绣，亲肤有机棉",
    desc: "以多子多福的鱼纹与循环不息的螺旋，为孩子缝制寓意吉祥、柔软安全的亲子服饰。",
  },
];

const TIMELINE = [
  { icon: Compass, title: "设计共创", desc: "设计师与苗绣传承人共研纹样语言，确立系列叙事。" },
  { icon: Scissors, title: "打样试制", desc: "依真实针法手工打样，平衡绣艺温度与穿着体验。" },
  { icon: Megaphone, title: "发布走秀", desc: "登上时装周与展览舞台，向世界讲述苗绣新章。" },
  { icon: Hammer, title: "展演衍生", desc: "延展联名与文创，让秀场纹样走进生活场景。" },
];

export function FashionContent() {
  return (
    <CreationPageShell slug="fashion">
      <SectionBanner
        src="/images/creation.jpg"
        alt="苗绣跨界时装"
        caption="盛装新制 · 古韵今风"
      />

      {/* 系列企划 */}
      <section className="py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            系列企划 · COLLECTIONS
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-primary mb-4">
            针线之间，古今相缝
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            四个系列从盛装到日常、从成人到亲子，让苗绣纹样在当代剪裁中重获呼吸。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {SERIES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
              className="group bg-card rounded-2xl border border-border p-6 lg:p-8 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {s.position}
                </span>
                <Shirt size={20} className="text-primary/60 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-serif text-xl lg:text-2xl font-bold text-primary mb-3">
                {s.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {s.desc}
              </p>
              <div className="space-y-2 pt-4 border-t border-border text-xs">
                <div className="flex items-start gap-2">
                  <Palette size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground flex-shrink-0">纹样来源</span>
                  <span className="text-foreground/80">{s.pattern}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground flex-shrink-0">面料工艺</span>
                  <span className="text-foreground/80">{s.craft}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 跨界合作路径 */}
      <section className="py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10"
        >
          <div className="inline-block px-3 py-1 mb-4 text-xs tracking-widest text-accent border border-accent/30 rounded-full">
            跨界合作路径 · PATHWAY
          </div>
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-primary mb-4">
            从共研到展演的四步
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIMELINE.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative bg-card rounded-2xl border border-border p-6"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <t.icon size={22} />
              </div>
              <div className="text-xs text-accent mb-1">0{i + 1}</div>
              <h3 className="font-serif text-lg font-bold text-primary mb-2">
                {t.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </CreationPageShell>
  );
}
