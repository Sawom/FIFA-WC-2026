"use client";

import { useEffect, useMemo, useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { StandingsTable } from "@/components/StandingsTable";
import WorldCupBracketModal from "@/components/WorldCupBracketModal";
import { WorldCupMatch } from "@/types/worldcup";
import { getFlagUrl, getGroupLetter, getMatchRoundLabel } from "@/lib/utils";
import Link from "next/link";

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

// TeamFlag component import or define koro:
function TeamFlag({ team }: { team: string }) {
  const flag = getFlagUrl(team);

  if (!flag) {
    return (
      <div className="flex h-6 w-9 shrink-0 items-center justify-center rounded bg-zinc-100 text-xs dark:bg-zinc-800">
        🏳️
      </div>
    );
  }

  return (
    <img
      src={flag}
      alt={`${team} flag`}
      className="h-6 w-9 shrink-0 rounded object-cover shadow-sm"
    />
  );
}


export default function Home() {
  const [matches, setMatches] = useState<WorldCupMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All Matches");
  const [timeZone, setTimeZone] = useState("Asia/Dhaka");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [bracketOpen, setBracketOpen] = useState(false);

  useEffect(() => {
    fetch("/data/worldcup-full.json")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load World Cup data");
        return response.json();
      })
      .then((data) => setMatches(data.matches ?? []))
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);


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

      <main className="mx-auto max-w-7xl px-4 pt-8">
        <div className="mb-7 text-center">
          {/* Animated Champion Badge */}
          <div className="mb-4 inline-flex items-center  justify-center gap-3 rounded-2xl border border-amber-300/60  via-amber-400/20 to-amber-500/10 px-6 py-3 shadow-lg shadow-amber-500/5 backdrop-blur-sm dark:border-amber-500/30 dark:from-amber-500/20 dark:to-amber-500/20">
            {/* Trophy with Pulse & Bounce Animation */}
            <span className="animate-bounce text-2xl md:text-3xl">🏆</span>

            <div className="flex items-center gap-2.5">
              <span className="text-xl font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 md:text-base">
                Champion:
              </span>

              {/* Spain Flag */}
              <TeamFlag team="Spain" />

              {/* Glowing / Animated Text */}
              <span className=" text-amber-600 bg-clip-text text-xl font-black  dark:text-amber-400 md:text-2xl">
                Spain
              </span>
            </div>

            {/* Celebratory Sparkles / Confetti Emoji */}
            <span className="animate-pulse text-2xl md:text-3xl">🎉</span>
          </div>

          <p className="text-xl font-black">June 11 – July 19, 2026</p>
          <p className="mt-1 text-s text-zinc-500 dark:text-zinc-400">
            104 matches • Full match details
          </p>
        </div>

        <section className="mb-7 flex flex-col items-center gap-3 md:flex-row">
          <div className="w-full md:max-w-md relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>

            <input
              type="search"
              placeholder="Search team, stadium or round..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400  focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="relative w-full md:w-64">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((value) => !value)}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
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
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
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
                className={`rounded cursor-pointer whitespace-nowrap shrink-0 border px-5 py-2.5 text-sm font-bold transition ${selectedTab === tab.label
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

              <Link href='/players' >
                <button className="rounded-xl bg-amber-500 cursor-pointer px-4 py-2 font-bold text-black" > Players </button>
              </Link>

              <button onClick={() => setBracketOpen(true)} className="rounded-xl bg-amber-500 cursor-pointer px-4 py-2 font-bold text-black" > Bracket </button>

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
              <div className="rounded-xl border border-dashed border-zinc-300 py-20 text-center dark:border-zinc-700">
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
