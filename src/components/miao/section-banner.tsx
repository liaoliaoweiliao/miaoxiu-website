"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface SectionBannerProps {
  src: string;
  alt: string;
  caption?: string;
  position?: string;
}

/**
 * 模块主视觉横幅：实拍质感氛围图 + 渐变遮罩 + 图注
 * 滚动进入视口时淡入上浮，悬停时轻微缩放
 */
export function SectionBanner({ src, alt, caption, position = "center" }: SectionBannerProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 兜底：lazy 图片可能在 React 水合前就加载完成（缓存/快速滚动），
  // 此时 onLoad 不会触发，需在挂载后主动检查 complete 状态
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative h-44 sm:h-56 lg:h-64 rounded-2xl overflow-hidden border border-border shadow-sm mb-12 group"
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
          loaded && !failed ? "opacity-100" : "opacity-0"
        }`}
        style={{ objectPosition: position }}
      />
      {/* 图片加载前的底色，避免闪烁 */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 to-accent/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/5 to-transparent pointer-events-none" />
      {/* 装饰角线 */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-white/50 rounded-tl-sm pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-white/50 rounded-br-sm pointer-events-none" />
      {caption && (
        <div className="absolute bottom-4 left-5 right-5 pointer-events-none">
          <p className="font-serif text-white/95 text-sm sm:text-base tracking-widest drop-shadow">
            {caption}
          </p>
        </div>
      )}
    </motion.div>
  );
}
