"use client";

import { useState, useEffect, useMemo } from "react";
import { Game, GroupData } from "@/types/worldcup";
import { MatchCard } from "@/components/MatchCard";
import { StandingsTable } from "@/components/StandingsTable";

const TIMEZONES = [
  { value: "Asia/Dhaka", label: "Dhaka (GMT+6)" },
  { value: "America/New_York", label: "New York (GMT-4)" },
  { value: "Europe/London", label: "London (GMT+1)" },
  { value: "Qatar", label: "Qatar (GMT+3)" },
];

// ১. মাস্টার ম্যাপ অবজেক্টটিকে কম্পোনেন্টের বাইরে রাখা হলো (গ্লোবাল স্কোপ), যেন রেন্ডারিংয়ে কখনো রেফারেন্স মিস না হয়
const tabApiMap: {
  [key: string]: { type: "group" | "knockout"; value: string };
} = {
  "Group A": { type: "group", value: "A" },
  "Group B": { type: "group", value: "B" },
  "Group C": { type: "group", value: "C" },
  "Group D": { type: "group", value: "D" },
  "Group E": { type: "group", value: "E" },
  "Group F": { type: "group", value: "F" },
  "Group G": { type: "group", value: "G" },
  "Group H": { type: "group", value: "H" },
  "Group I": { type: "group", value: "I" },
  "Group J": { type: "group", value: "J" },
  "Group K": { type: "group", value: "K" },
  "Group L": { type: "group", value: "L" },
  "Round 32": { type: "knockout", value: "r32" },
  "Round 16": { type: "knockout", value: "r16" },
  "Quarter Final": { type: "knockout", value: "qf" },
  "Semi Final": { type: "knockout", value: "sf" },
  "3RD place": { type: "knockout", value: "3rd" },
  FINAL: { type: "knockout", value: "final" },
};

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All Matches");
  const [timeZone, setTimeZone] = useState("Asia/Dhaka");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetch("https://worldcup26.ir/get/games")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.games) setGames(data.games);
        setLoading(false);
      });

    fetch("https://worldcup26.ir/get/groups")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.groups) setGroups(data.groups);
      });
  }, []);

  // টেলউইন্ড v4 এর জন্য ডার্ক মোড রুট টগল
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // সিঙ্গেল অবজেক্ট বেসড নিখুঁত ফিল্টারিং লজিক
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const homeTeamName = game.home_team_name_en || "";
      const awayTeamName = game.away_team_name_en || "";
      const matchesSearch =
        homeTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        awayTeamName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedTab === "All Matches") return true;

      const tabConfig = tabApiMap[selectedTab];
      if (!tabConfig) return false;

      if (tabConfig.type === "group") {
        return game.group === tabConfig.value;
      } else {
        return (
          (game.type || "").toLowerCase() === tabConfig.value.toLowerCase()
        );
      }
    });
  }, [games, selectedTab, searchQuery]);

  // পয়েন্ট টেবিল কন্ট্রোল
  const activeGroupStandings = useMemo(() => {
    const tabConfig = tabApiMap[selectedTab];
    if (tabConfig && tabConfig.type === "group") {
      return groups.find((g) => g.name === tabConfig.value);
    }
    return undefined;
  }, [groups, selectedTab]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors pb-20">
      {/* Navigation Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <h1 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white">
              WORLD CUP 2026
            </h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700"
          >
            {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {/* Search & Filter Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm text-zinc-900 dark:text-white"
            />
          </div>
          <select
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            className="w-full md:w-64 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none text-sm cursor-pointer shadow-sm text-zinc-900 dark:text-white"
          >
            {TIMEZONES.map((z) => (
              <option
                key={z.value}
                value={z.value}
                className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              >
                {z.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 custom-scrollbar">
          <button
            onClick={() => setSelectedTab("All Matches")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-200 ${
              selectedTab === "All Matches"
                ? "bg-amber-500 border-amber-500 text-white shadow-md scale-105"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-amber-500"
            }`}
          >
            All Matches
          </button>

          {Object.keys(tabApiMap).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-200 ${
                selectedTab === tab
                  ? "bg-amber-500 border-amber-500 text-white shadow-md scale-105"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-amber-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-400 font-medium">Loading Data...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeGroupStandings && (
              <StandingsTable
                teams={activeGroupStandings.teams}
                groupName={activeGroupStandings.name}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <MatchCard key={game.id} game={game} timeZone={timeZone} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
