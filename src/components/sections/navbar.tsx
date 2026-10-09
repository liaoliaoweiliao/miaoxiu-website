"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "hero", label: "首页", en: "Home" },
  { id: "history", label: "绣·史", en: "History" },
  { id: "patterns", label: "绣·纹", en: "Patterns" },
  { id: "craft", label: "绣·艺", en: "Craft" },
  { id: "innovation", label: "绣·新", en: "Innovation" },
  { id: "people", label: "绣·人", en: "People" },
  { id: "creation", label: "绣·创", en: "Creation" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(
    pathname.startsWith("/creation") ? "creation" : "hero"
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // 仅在首页检测当前 section（子页面无对应锚点）
      if (pathname !== "/") return;

      // 检测当前section
      const sections = NAV_ITEMS.map((item) => item.id);
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const scrollToSection = (id: string) => {
    // 子页面时跳回首页对应锚点
    if (!isHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const goHome = () => {
    if (isHome) {
      scrollToSection("hero");
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button
              onClick={() => goHome()}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-primary"
                  />
                  <path
                    d="M24 8 C 18 16, 18 32, 24 40 C 30 32, 30 16, 24 8 Z"
                    fill="currentColor"
                    className="text-accent"
                    opacity="0.85"
                  />
                  <circle cx="24" cy="24" r="3" fill="currentColor" className="text-primary" />
                  <circle cx="14" cy="24" r="2" fill="currentColor" className="text-accent" />
                  <circle cx="34" cy="24" r="2" fill="currentColor" className="text-accent" />
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <span className="font-serif text-lg lg:text-xl font-bold text-primary leading-none">
                  苗绣·生生不息
                </span>
                <span className="text-[10px] lg:text-xs text-muted-foreground tracking-widest mt-0.5">
                  MIAO EMBROIDERY
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-md",
                    activeSection === item.id
                      ? "text-accent"
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  <span className="font-serif">{item.label}</span>
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="菜单"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 lg:hidden bg-background/98 backdrop-blur-md border-b border-border shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-md font-serif text-base transition-colors",
                    activeSection === item.id
                      ? "bg-accent/10 text-accent"
                      : "text-foreground/80 hover:bg-muted"
                  )}
                >
                  <span className="mr-3 text-xs text-muted-foreground">
                    {item.en}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
