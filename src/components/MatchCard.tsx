import React from "react";
import { Game } from "@/types/worldcup";

interface MatchCardProps {
  game: Game;
  timeZone: string;
}

export const MatchCard: React.FC<MatchCardProps> = ({ game, timeZone }) => {
  let displayTime = game.local_date;

  try {
    // 1. Separate data from the API's 'dd/mm/yyyy hh:mm AM/PM' or 24-hour format
    const [datePart, timePart, ampmPart] = game.local_date.split(" ");
    const parts = datePart.split("/").map(Number);

    // Safety Check: Separating the day and month
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];
    if (parts[0] <= 12 && parts[1] > 12) {
      month = parts[0];
      day = parts[1];
    }

    const timeComponents = timePart.split(":").map(Number);
    let hours = timeComponents[0];
    const minutes = timeComponents[1];

    // If the API returns time in 12-hour AM/PM format
    if (ampmPart) {
      if (ampmPart.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (ampmPart.toUpperCase() === "AM" && hours === 12) hours = 0;
    }

    // 2. Since the API time is the local time of the venue (e.g. New York/EDT - GMT-4), we will first convert it back to pure UTC.
    // To go from New York (GMT-4) to UTC, we need to add 4 hours.
    const venueOffset = -4;
    const utcTimeInMs =
      Date.UTC(year, month - 1, day, hours, minutes) -
      venueOffset * 60 * 60 * 1000;

    // 3. Add offset according to the zone selected by the user in the dropdown (relative to UTC)
    let targetOffset = 6; // ডিফল্ট ঢাকা (GMT+6)
    if (timeZone === "Asia/Dhaka") targetOffset = 6;
    if (timeZone === "America/New_York") targetOffset = -4;
    if (timeZone === "Europe/London") targetOffset = 1;
    if (timeZone === "Qatar") targetOffset = 3;

    // miliseconds calculation
    const targetTimeInMs = utcTimeInMs + targetOffset * 60 * 60 * 1000;
    const finalDate = new Date(targetTimeInMs);

    // 4. output formatting (dd/MM/yyyy hh:mm AM/PM)
    const d = String(finalDate.getUTCDate()).padStart(2, "0");
    const m = String(finalDate.getUTCMonth() + 1).padStart(2, "0");
    const y = finalDate.getUTCFullYear();

    let h = finalDate.getUTCHours();
    const min = String(finalDate.getUTCMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;
    h = h ? h : 12;
    const hr = String(h).padStart(2, "0");

    displayTime = `${d}/${m}/${y} ${hr}:${min} ${ampm}`;
  } catch (e) {
    displayTime = game.local_date;
  }

  const isLive =
    game.time_elapsed !== "notstarted" && game.finished === "FALSE";
  const isFinished = game.finished === "TRUE";

  const homeTeam = game.home_team_name_en || "TBD";
  const awayTeam = game.away_team_name_en || "TBD";

  const getFlagUrl = (teamName: string) => {
    if (teamName === "TBD") return null;

    // নিখুঁত ফ্ল্যাগ কোড ম্যাপিং (সবগুলো নতুন মিসিং দেশের জেনুইন ISO কোডসহ)
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
    };

    const cleanName = teamName.trim();

    // ১. একদম হুবহু মিল থাকলে সরাসরি রিটার্ন
    if (customMaps[cleanName]) {
      return `https://flagcdn.com/w80/${customMaps[cleanName]}.png`;
    }

    // ২. আংশিক নামের মিল খুঁজবে (যেমন টেক্সট ট্রাঙ্কেট হলে বা ছোট-বড় হাতের অক্ষরের অমিল হলে)
    for (const key in customMaps) {
      if (
        cleanName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(cleanName.toLowerCase())
      ) {
        return `https://flagcdn.com/w80/${customMaps[key]}.png`;
      }
    }

    // ৩. উপরে কোনোটার সাথে না মিললে ডিফল্ট প্রথম ২ অক্ষর
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
    <div className="relative p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
      {/* Top Header Row */}
      <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-amber-600 dark:text-amber-500">
          {game.type === "group"
            ? `Group ${game.group}`
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
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
        <span className="font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-1 rounded-lg">
          {displayTime}
        </span>
        {!isFinished && homeTeam !== "TBD" && awayTeam !== "TBD" && (
          <a
            href={getCalendarLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-amber-500 transition-colors"
          >
            🔔
          </a>
        )}
      </div>
    </div>
  );
};
