"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { StandingsTable } from "@/components/StandingsTable";
import WorldCupBracketModal from "@/components/WorldCupBracketModal";
import { WorldCupMatch } from "@/types/worldcup";
import { getGroupLetter, getMatchRoundLabel } from "@/lib/utils";
import logo from "../asset/logo.png";

const TIMEZONES = [
  { value: "Asia/Dhaka", label: "Dhaka (GMT+6)" },
  { value: "America/New_York", label: "New York" },
  { value: "Europe/London", label: "London" },
  { value: "Asia/Qatar", label: "Qatar (GMT+3)" },
];

const TABS = [
  { label: "All Matches", round: null },
  ...Array.from({ length: 12 }, (_, i) => ({
    label: `Group ${String.fromCharCode(65 + i)}`,
    round: `First Stage, Group ${String.fromCharCode(65 + i)}`,
  })),
  { label: "Round of 32", round: "Round of 32" },
  { label: "Round of 16", round: "Round of 16" },
  { label: "Quarter Final", round: "Quarter-final" },
  { label: "Semi Final", round: "Semi-final" },
  { label: "3rd Place", round: "Bronze final" },
  { label: "Final", round: "Final" },
];

export default function Home() {
  const [matches, setMatches] = useState<WorldCupMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All Matches");
  const [timeZone, setTimeZone] = useState("Asia/Dhaka");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bracketOpen, setBracketOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");

    fetch("/data/worldcup-full.json")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load World Cup data");
        return response.json();
      })
      .then((data) => setMatches(data.matches ?? []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const filteredMatches = useMemo(() => {
    const selected = TABS.find((tab) => tab.label === selectedTab);
    const query = searchQuery.trim().toLowerCase();

    return matches
      .map((match, index) => ({ match, index }))
      .filter(({ match }) => {
        const matchesSearch =
          !query ||
          match.team1.toLowerCase().includes(query) ||
          match.team2.toLowerCase().includes(query) ||
          match.ground.toLowerCase().includes(query) ||
          match.round.toLowerCase().includes(query);

        const matchesTab = !selected?.round || match.round === selected.round;
        return matchesSearch && matchesTab;
      });
  }, [matches, searchQuery, selectedTab]);

  const selectedGroup = getGroupLetter(
    TABS.find((tab) => tab.label === selectedTab)?.round ?? ""
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0">
              <Image src={logo} alt="FIFA World Cup 2026 Logo" fill className="object-contain" priority unoptimized />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">WORLD CUP 2026</h1>
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

          <button
            onClick={() => setIsDarkMode((value) => !value)}
            className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2 text-xs font-bold transition hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-8">
        <div className="mb-7 text-center">
          <p className="text-lg font-black">June 11 – July 19, 2026</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            104 matches • Full match details from the local dataset
          </p>
        </div>

        <section className="mb-7 flex flex-col items-center gap-3 md:flex-row">
          <div className="w-full md:max-w-md">
            <input
              type="search"
              placeholder="Search team, stadium or round..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div className="relative w-full md:w-64">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((value) => !value)}
              className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              {TIMEZONES.find((zone) => zone.value === timeZone)?.label}
              <span className={isDropdownOpen ? "rotate-180" : ""}>⌄</span>
            </button>

            {isDropdownOpen && (
              <>
                <button
                  aria-label="Close timezone menu"
                  className="fixed inset-0 z-10 h-full w-full cursor-default"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  {TIMEZONES.map((zone) => (
                    <button
                      key={zone.value}
                      onClick={() => {
                        setTimeZone(zone.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2.5 text-left text-sm ${timeZone === zone.value
                        ? "bg-amber-500 font-bold text-black"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                    >
                      {zone.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setSelectedTab(tab.label)}
                className={`rounded-full border px-5 py-2.5 text-xs font-bold transition ${selectedTab === tab.label
                  ? "border-amber-500 bg-amber-500 text-black shadow-md"
                  : "border-zinc-200 bg-white text-zinc-500 hover:border-amber-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-zinc-400">Loading World Cup data...</p>
          </div>
        ) : (
          <>
            {selectedGroup && <StandingsTable matches={matches} group={selectedGroup} />}

            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-black">{getMatchRoundLabel(TABS.find((tab) => tab.label === selectedTab)?.round ?? "All Matches")}</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {filteredMatches.length} match{filteredMatches.length === 1 ? "" : "es"} found
                </p>
              </div>

              <button onClick={() => setBracketOpen(true)} className="rounded-xl bg-amber-500 px-4 py-2 font-bold text-black" > Bracket </button>

              <WorldCupBracketModal open={bracketOpen} onClose={() => setBracketOpen(false)} />
            </div>

            {filteredMatches.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredMatches.map(({ match, index }) => (
                  <MatchCard
                    key={`${match.date}-${match.team1}-${match.team2}`}
                    match={match}
                    matchIndex={index}
                    timeZone={timeZone}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
                <p className="font-bold">No matches found</p>
                <p className="mt-1 text-sm text-zinc-500">Try another team or round.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
