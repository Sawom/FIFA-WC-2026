import { Goal, WorldCupMatch } from "@/types/worldcup";

export const FLAG_CODES: Record<string, string> = {
  "Algeria": "dz",
  "Argentina": "ar",
  "Australia": "au",
  "Austria": "at",
  "Belgium": "be",
  "Bosnia and Herzegovina": "ba",
  "Brazil": "br",
  "Cabo Verde": "cv",
  "Canada": "ca",
  "Colombia": "co",
  "Congo DR": "cd",
  "Croatia": "hr",
  "Curaçao": "cw",
  "Czech Republic": "cz",
  "Côte d'Ivoire": "ci",
  "Ecuador": "ec",
  "Egypt": "eg",
  "England": "gb-eng",
  "France": "fr",
  "Germany": "de",
  "Ghana": "gh",
  "Haiti": "ht",
  "Iran": "ir",
  "Iraq": "iq",
  "Japan": "jp",
  "Jordan": "jo",
  "Mexico": "mx",
  "Morocco": "ma",
  "Netherlands": "nl",
  "New Zealand": "nz",
  "Norway": "no",
  "Panama": "pa",
  "Paraguay": "py",
  "Portugal": "pt",
  "Qatar": "qa",
  "Saudi Arabia": "sa",
  "Scotland": "gb-sct",
  "Senegal": "sn",
  "South Africa": "za",
  "South Korea": "kr",
  "Spain": "es",
  "Sweden": "se",
  "Switzerland": "ch",
  "Tunisia": "tn",
  "Turkey": "tr",
  "USA": "us",
  "Uruguay": "uy",
  "Uzbekistan": "uz"
};

export function getFlagUrl(team: string) {
  const code = FLAG_CODES[team];
  return code ? `https://flagcdn.com/w80/${code}.png` : null;
}

export function getMatchId(match: WorldCupMatch, index: number) {
  return String(index + 1);
}

export function getMatchRoundLabel(round: string) {
  if (round.startsWith("First Stage, Group ")) {
    return `Group ${round.replace("First Stage, Group ", "")}`;
  }
  if (round === "Round of 32") return "Round of 32";
  if (round === "Round of 16") return "Round of 16";
  if (round === "Quarter-final") return "Quarter Final";
  if (round === "Semi-final") return "Semi Final";
  if (round === "Bronze final") return "3rd Place";
  if (round === "Final") return "Final";
  return round;
}

export function getGroupLetter(round: string) {
  const match = round.match(/Group ([A-L])/i);
  return match?.[1]?.toUpperCase() ?? null;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatKickoff(date: string, time: string, targetTimeZone: string) {
  try {
    const match = time.match(/^(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})(?::(\d{2}))?$/i);
    if (!match) return `${formatDate(date)} • ${time}`;

    const [, hour, minute, offsetHour, offsetMinute = "0"] = match;
    const sign = Number(offsetHour) >= 0 ? "+" : "-";
    const absoluteHour = Math.abs(Number(offsetHour)).toString().padStart(2, "0");
    const absoluteMinute = Math.abs(Number(offsetMinute)).toString().padStart(2, "0");
    const iso = `${date}T${hour.padStart(2, "0")}:${minute}:00${sign}${absoluteHour}:${absoluteMinute}`;

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: targetTimeZone,
    }).format(new Date(iso));
  } catch {
    return `${formatDate(date)} • ${time}`;
  }
}

export function getAllGoals(match: WorldCupMatch): Goal[] {
  return [...match.goals1, ...match.goals2].sort((a, b) =>
    a.minute.localeCompare(b.minute, undefined, { numeric: true })
  );
}

export function getWinner(match: WorldCupMatch) {
  const [a, b] = match.score.ft;
  if (a === b) return "Draw";
  return a > b ? match.team1 : match.team2;
}
