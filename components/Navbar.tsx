"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";

const links = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/members", label: "MEMBERS" },
  { href: "/news", label: "NEWS" },
  { href: "/partners", label: "PARTNERS" },
  { href: "/join", label: "JOIN US" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={clsx(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "backdrop-blur-xl bg-awa-indigo-950/70 border-b border-neon-cyan/20"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            initial={{ rotate: -4 }}
            whileHover={{ rotate: 0, scale: 1.05 }}
            className="relative w-9 h-9 md:w-10 md:h-10"
          >
            <svg viewBox="0 0 40 44" className="w-full h-full">
              <defs>
                <linearGradient id="agShieldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" />
                  <stop offset="100%" stopColor="#2DFFB7" />
                </linearGradient>
              </defs>
              <path
                d="M 20 3 L 37 8 L 37 24 C 37 33 30 39 20 41 C 10 39 3 33 3 24 L 3 8 Z"
                fill="rgba(7,11,31,0.6)"
                stroke="url(#agShieldGrad)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <text
                x="20"
                y="27"
                textAnchor="middle"
                fontFamily="Orbitron"
                fontWeight="900"
                fontSize="14"
                fill="#FFFFFF"
                letterSpacing="-0.5"
              >
                AG
              </text>
            </svg>
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-black tracking-[0.2em] text-sm md:text-base text-white">
              AWAKEN GLOW
            </span>
            <span className="text-[10px] tracking-[0.3em] text-awa-glow/80 mt-0.5">
              A.G. / 阿波の意地
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="relative px-4 py-2 group"
              >
                <span
                  className={clsx(
                    "relative z-10 text-xs font-display tracking-[0.25em] transition-colors",
                    active
                      ? "text-neon-cyan"
                      : "text-white/70 group-hover:text-white",
                  )}
                >
                  {l.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="navActive"
                    className="absolute inset-0 rounded-md border border-neon-cyan/40 bg-neon-cyan/5 shadow-neon"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="absolute left-1/2 -bottom-0.5 h-px w-0 bg-gradient-to-r from-awa-glow to-neon-cyan transition-all duration-300 group-hover:w-3/4 group-hover:-translate-x-1/2" />
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-2"
          aria-label="menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-neon-cyan/20 bg-awa-indigo-950/95 backdrop-blur-xl"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    "px-4 py-3 rounded-md font-display tracking-[0.25em] text-sm",
                    pathname === l.href
                      ? "text-neon-cyan bg-neon-cyan/5 border border-neon-cyan/30"
                      : "text-white/80",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
