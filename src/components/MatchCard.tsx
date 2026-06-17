import React from "react";
import { Game } from "@/types/worldcup";
import { DateTime } from "luxon";

interface MatchCardProps {
  game: Game;
  timeZone: string;
}

export const MatchCard: React.FC<MatchCardProps> = ({ game, timeZone }) => {
  const parseScorers = (data: string | null | undefined) => {
    if (!data || data === "null") return [];

    try {
      // ২. স্মার্ট কোট “ ” এবং \ কে ক্লিন করা
      let sanitized = data
        .replace(/“/g, '"')
        .replace(/”/g, '"')
        .replace(/\\"/g, '"');

      // ৩. যদি ডেটা এমন হয় {”a”,”b”} তবে সেটিকে ["a", "b"] এ রূপান্তর করা
      sanitized = sanitized.replace(/\{/g, "[").replace(/\}/g, "]");

      const parsed = JSON.parse(sanitized);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Scorer parsing error:", e);
      return [];
    }
  };

  // time zone
  const stadiumTimezones: Record<string, string> = {
    "1": "America/Mexico_City",
    "2": "America/Mexico_City",
    "3": "America/Monterrey",
    "4": "America/Chicago",
    "5": "America/Chicago",
    "6": "America/Chicago",
    "7": "America/New_York",
    "8": "America/New_York",
    "9": "America/New_York",
    "10": "America/New_York",
    "11": "America/New_York",
    "12": "America/Toronto",
    "13": "America/Vancouver",
    "14": "America/Los_Angeles",
    "15": "America/Los_Angeles",
    "16": "America/Los_Angeles",
  };

  // stadiums
  const stadiumNames: Record<string, string> = {
    "1": "Mexico City Stadium",
    "2": "Estadio Guadalajara",
    "3": "Estadio Monterrey",
    "4": "Dallas Stadium",
    "5": "Houston Stadium",
    "6": "Kansas City Stadium",
    "7": "Atlanta Stadium",
    "8": "Miami Stadium",
    "9": "Boston Stadium",
    "10": "Philadelphia Stadium",
    "11": "MetLife Stadium",
    "12": "Toronto Stadium",
    "13": "BC Place Vancouver",
    "14": "Seattle Stadium",
    "15": "San Francisco Bay Area Stadium",
    "16": "Los Angeles Stadium",
  };

  const venueName = stadiumNames[(game as any).stadium_id] || "Unknown Stadium";

  // timezone calculation
  const getFormattedTime = () => {
    try {
      const [datePart, timePart] = game.local_date.trim().split(/\s+/);
      const [month, day, year] = datePart.split("/").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);

      // venue এর timezone দিয়ে parse করো
      const venueZone = stadiumTimezones[game.stadium_id] ?? "America/New_York";

      const dt = DateTime.fromObject(
        { year, month, day, hour, minute },
        { zone: venueZone },
      );

      const zoneMap: Record<string, string> = {
        "Asia/Dhaka": "Asia/Dhaka",
        "America/New_York": "America/New_York",
        "Europe/London": "Europe/London",
        "Asia/Qatar": "Asia/Qatar",
      };

      const targetZone = zoneMap[timeZone] ?? "Asia/Dhaka";

      return dt
        .setZone(targetZone)
        .toFormat("dd/MM/yyyy hh:mm a")
        .toLowerCase();
    } catch (e) {
      return game.local_date;
    }
  };

  const displayTime = getFormattedTime();

  const isLive =
    game.time_elapsed !== "notstarted" && game.finished === "FALSE";
  const isFinished = game.finished === "TRUE";

  const homeTeam = game.home_team_name_en || "TBD";
  const awayTeam = game.away_team_name_en || "TBD";

  const getFlagUrl = (teamName: string) => {
    if (teamName === "TBD") return null;

    const customMaps: { [key: string]: string } = {
      USA: "us",
      "United States": "us",
      "South Africa": "za",
      "South Korea": "kr",
      "Czech Republic": "cz",
      "Saudi Arabia": "sa",
      England: "gb-eng",
      Brazil: "br",
      Morocco: "ma",
      Spain: "es",
      Portugal: "pt",
      Uruguay: "uy",
      Iran: "ir",
      Japan: "jp",
      Argentina: "ar",
      Belgium: "be",
      Germany: "de",
      "Democratic Republic of the Congo": "cd",
      "Democratic Republic...": "cd",
      "Bosnia and Herzegovina": "ba",
      "Bosnia and..": "ba",
      Haiti: "ht",
      Turkey: "tr",
      Switzerland: "ch",
      "Ivory Coast": "ci",
      "Côte d'Ivoire": "ci",
      Sweden: "se",
      Tunisia: "tn",
      Netherlands: "nl",
      "New Zealand": "nz",
      Austria: "at",
      Croatia: "hr",
      Algeria: "dz",
    };

    const cleanName = teamName.trim();

    if (customMaps[cleanName]) {
      return `https://flagcdn.com/w80/${customMaps[cleanName]}.png`;
    }

    for (const key in customMaps) {
      if (
        cleanName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(cleanName.toLowerCase())
      ) {
        return `https://flagcdn.com/w80/${customMaps[key]}.png`;
      }
    }

    const code = cleanName.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/w80/${code}.png`;
  };

  const homeFlag = getFlagUrl(homeTeam);
  const awayFlag = getFlagUrl(awayTeam);

  const getCalendarLink = () => {
    const title = encodeURIComponent(`${homeTeam} vs ${awayTeam} - FIFA 2026`);
    const details = encodeURIComponent(
      `Stage: ${game.type.toUpperCase()}, Group: ${game.group}`,
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
  };

  return (
    <div className="relative p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 transition-all shadow-sm hover:shadow-md flex flex-col justify-between gap-4">
      {/* Top Header Row */}
      <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-amber-600 dark:text-amber-500">
          MATCH #{game.id} |{" "}
          {game.type === "group"
            ? `GROUP ${game.group}`
            : game.type.toUpperCase()}
        </span>
        {isLive && (
          <span className="flex items-center gap-1 text-red-500 animate-pulse bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Live
          </span>
        )}
        {!isLive && !isFinished && <span>Matchday {game.matchday}</span>}
        {isFinished && <span className="text-zinc-400">Finished</span>}
      </div>

      {/* Teams and Score Area */}
      <div className="flex justify-between items-center my-2">
        {/* Home Team */}
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="w-12 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden shadow-sm">
            {homeFlag ? (
              <img
                src={homeFlag}
                alt={homeTeam}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerText = homeTeam
                      .slice(0, 3)
                      .toUpperCase();
                  }
                }}
              />
            ) : (
              <span className="font-bold text-xs text-zinc-400">TBD</span>
            )}
          </div>
          <span
            className={`mt-2 text-sm font-semibold line-clamp-1 ${homeTeam === "TBD" ? "text-zinc-400 italic" : "text-zinc-800 dark:text-zinc-200"}`}
          >
            {homeTeam}
          </span>
          {/* Home Team Scorers */}
          <div className="flex flex-col gap-1 mt-1">
            {parseScorers(game.home_scorers).map(
              (scorer: string, i: number) => (
                <span
                  key={i}
                  className="text-[10px] text-zinc-500 font-medium text-center truncate"
                >
                  ⚽ {scorer}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Score Board */}
        <div className="flex flex-col items-center px-4">
          {isFinished || isLive ? (
            <span className="text-2xl font-black tracking-wider text-zinc-900 dark:text-amber-500">
              {game.home_score} - {game.away_score}
            </span>
          ) : (
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1 rounded-full">
              VS
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="w-12 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden shadow-sm">
            {awayFlag ? (
              <img
                src={awayFlag}
                alt={awayTeam}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerText = awayTeam
                      .slice(0, 3)
                      .toUpperCase();
                  }
                }}
              />
            ) : (
              <span className="font-bold text-xs text-zinc-400">TBD</span>
            )}
          </div>
          <span
            className={`mt-2 text-sm font-semibold line-clamp-1 ${awayTeam === "TBD" ? "text-zinc-400 italic" : "text-zinc-800 dark:text-zinc-200"}`}
          >
            {awayTeam}
          </span>

          <div className="flex flex-col gap-1 mt-1">
            {parseScorers(game.away_scorers).map(
              (scorer: string, i: number) => (
                <span
                  key={i}
                  className="text-[10px] text-zinc-500 font-medium text-center truncate"
                >
                  ⚽ {scorer}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs text-zinc-400">
          {/* date and time */}
          <span className="font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1 rounded-lg">
            {displayTime}
          </span>

          {/* venue */}
          <div className="flex items-center gap-1.5 max-w-[55%] md:max-w-[60%]">
            <span className="font-bold text-[11px] text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1 rounded-lg">
              🏟️ {venueName}
            </span>

            {!isFinished && homeTeam !== "TBD" && awayTeam !== "TBD" && (
              <a
                href={getCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-amber-500 transition-colors flex-shrink-0"
              >
                🔔
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
