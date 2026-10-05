"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import logo from "../asset/logo.png";

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Client-side hydration completion check
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                {/* Logo & Info */}
                <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0">
                        <Image
                            src={logo}
                            alt="FIFA World Cup 2026 Logo"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight">
                            WORLD CUP 2026
                        </h1>
                        <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
                            Developed by{" "}
                            <a
                                href="https://www.linkedin.com/in/abdur-rashid-sawom-3379a0262/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-zinc-900 hover:text-amber-600 hover:underline dark:text-amber-400"
                            >
                                Abdur Rashid Sawom
                            </a>
                        </p>
                    </div>
                </div>

                {/* Theme Toggle Button */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-xl cursor-pointer border border-zinc-200 bg-zinc-100 px-4 py-2 text-xs font-bold transition hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    >
                        {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                    </button>
                )}
            </div>
        </header>
    );
}