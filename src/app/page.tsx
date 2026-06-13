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

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All Matches");
  const [timeZone, setTimeZone] = useState("Asia/Dhaka");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const tabs = [
    "All Matches",
    "Group A",
    "Group B",
    "Group C",
    "Group D",
    "Group E",
    "Group F",
    "Group G",
    "Group H",
    "Group I",
    "Group J",
    "Group K",
    "Group L",
    "Group R32",
    "Group R16",
    "Group QF",
    "Group SF",
    "Group 3RD",
    "Group FINAL",
  ];

  useEffect(() => {
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (localZone) setTimeZone(localZone);

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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // 1. tab & group safety checking
      const tabGroup = selectedTab.replace("Group ", "");

      // handled if game.group and game.type are null or undefined
      const gameGroup = game.group || "";
      const gameType = game.type || "";

      const matchesTab =
        selectedTab === "All Matches" ||
        gameGroup === tabGroup ||
        gameType.toLowerCase() === tabGroup.toLowerCase();

      // 2. Home and Away Team Name Safety Check (TBD to be handled)
      const homeTeamName = game.home_team_name_en || "";
      const awayTeamName = game.away_team_name_en || "";

      const matchesSearch =
        homeTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        awayTeamName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [games, selectedTab, searchQuery]);

  const activeGroupStandings = useMemo(() => {
    const groupName = selectedTab.replace("Group ", "");
    return groups.find((g) => g.name === groupName);
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
            className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
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
              className="w-full pl-4 pr-10 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
            />
          </div>
          <select
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            className="w-full md:w-64 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none text-sm cursor-pointer shadow-sm"
          >
            {TIMEZONES.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-8 no-scrollbar">
          {tabs.map((tab) => (
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

        {/* Dynamic Display Grid */}
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
