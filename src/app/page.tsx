"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { StandingsTable } from "@/components/StandingsTable";
import { MatchCard } from "@/components/MatchCard";
import { Game } from "@/types/worldcup";
import logo from "../asset/logo.png";

interface GroupData {
  name: string;
  teams: any[];
}

const TIMEZONES = [
  { value: "Asia/Dhaka", label: "Dhaka (GMT+6)" },
  { value: "America/New_York", label: "New York (GMT-4)" },
  { value: "Europe/London", label: "London (GMT+1)" },
  { value: "Qatar", label: "Qatar (GMT+3)" },
];

// 1. The master map object is kept outside the component (global scope), so that the reference is never missed during rendering
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
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All Matches");
  const [timeZone, setTimeZone] = useState("Asia/Dhaka");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // dark / light mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme === "dark";
    }
    return false;
  });

  //  (async/await + Promise.all)
  useEffect(() => {
    const loadInitialDashboardData = async () => {
      try {
        setLoading(true);

        const [gamesRes, groupsRes, teamsRes] = await Promise.all([
          fetch("https://worldcup26.ir/get/games"),
          fetch("https://worldcup26.ir/get/groups"),
          fetch("https://worldcup26.ir/get/teams"),
        ]);

        // Convert responses to JSON
        const gamesData = await gamesRes.json();
        const groupsData = await groupsRes.json();
        const teamsData = await teamsRes.json();

        // Checking for correct and valid data and push it to the state.
        if (gamesData && gamesData.games) setGames(gamesData.games);
        if (groupsData && groupsData.groups) setGroups(groupsData.groups);
        if (teamsData && teamsData.teams) setAllTeams(teamsData.teams);
      } catch (err) {
        console.error("Dashboard Global Data Fetching Error:", err);
      } finally {
        setLoading(false); // The loader will stop as soon as all data has been received successfully or failed.
      }
    };

    loadInitialDashboardData();
  }, []);

  // dark / light mode
  // save mode states is local storage
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // filtering
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

  // point table control
  const activeGroupStandings = useMemo(() => {
    const tabConfig = tabApiMap[selectedTab];
    if (tabConfig && tabConfig.type === "group") {
      return groups.find((g) => {
        if (!g || !g.name) return false;

        const apiGroupName = String(g.name).toLowerCase().trim();
        const targetValue = String(tabConfig.value).toLowerCase().trim();

        return (
          apiGroupName === targetValue ||
          apiGroupName === `group ${targetValue}`
        );
      });
    }
    return undefined;
  }, [groups, selectedTab]);

  // console.log("--- DEBUGGING WORLD CUP DATA ---");
  // console.log("All Teams Data from API:", allTeams);
  // console.log("Active Group Standings Data:", activeGroupStandings);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors pb-20">
      {/* Navigation Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image
                src={logo}
                alt="FIFA World Cup 2026 Logo"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white leading-tight">
                WORLD CUP 2026
              </h1>

              <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 select-none">
                Developed by
                <a
                  href="https://www.linkedin.com/in/abdur-rashid-sawom-3379a0262/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-black mx-3 dark:text-amber-400 hover:underline hover:text-amber-600 transition-all cursor-pointer"
                >
                  Abdur Rashid Sawom
                </a>
              </p>
            </div>
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
        <p className="mb-6 text-center text-[18px] font-bold">
          June 11 - July 19, 2026
        </p>
        {/* Search & Filter Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          {/* 1. search */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm text-zinc-900 dark:text-white"
            />
          </div>

          {/* dropdown menu */}
          <div className="relative w-full md:w-64">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full pl-4 pr-10 py-3 text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none text-sm cursor-pointer shadow-sm text-zinc-900 dark:text-white
               focus:ring-2 focus:ring-amber-500 transition-all flex justify-between items-center"
            >
              <span>
                {TIMEZONES.find((z) => z.value === timeZone)?.label ||
                  "Select Timezone"}
              </span>
              <svg
                className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />

                <div className="absolute z-20 w-full mt-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-1 flex flex-col gap-1">
                    {TIMEZONES.map((z) => {
                      const isSelected = z.value === timeZone;
                      return (
                        <button
                          key={z.value}
                          type="button"
                          onClick={() => {
                            setTimeZone(z.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-amber-500 text-black font-semibold shadow-sm"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:scale-[0.99]"
                          }`}
                        >
                          <span>{z.label}</span>
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-black"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Tab Navigation Menu */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 custom-scrollbar">
          <button
            onClick={() => setSelectedTab("All Matches")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-200 ${
              selectedTab === "All Matches"
                ? "bg-amber-500 border-amber-500 text-black shadow-md scale-105"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-zinc-400 hover:border-amber-500"
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
                  ? "bg-amber-500 border-amber-500 text-black shadow-md scale-105"
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
            {/*  table rendering section */}
            {activeGroupStandings && (
              <StandingsTable
                teams={activeGroupStandings.teams}
                groupName={activeGroupStandings.name}
                allTeamsData={allTeams}
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
