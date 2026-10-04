
import Link from "next/link";
import React from "react";
import { WorldCupMatch } from "@/types/worldcup";
import {
  formatKickoff,
  getFlagUrl,
  getMatchId,
  getMatchRoundLabel,
} from "@/lib/utils";

interface MatchCardProps {
  match: WorldCupMatch;
  matchIndex: number;
  timeZone: string;
}

function Scorers({
  goals,
  emptyText = "No goals",
}: {
  goals: WorldCupMatch["goals1"];
  emptyText?: string;
}) {
  const safeGoals = Array.isArray(goals) ? goals : [];

  if (!safeGoals.length) {
    return <span className="text-[10px] text-zinc-400">{emptyText}</span>;
  }

  return (
    <div className="mt-2 flex w-full flex-col gap-1">
      {safeGoals.map((goal, index) => (
        <div
          key={`${goal.name}-${goal.minute}-${index}`}
          className="flex items-center justify-center gap-1.5 text-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
        >
          <span>⚽</span>

          <span className="truncate">{goal.name}</span>

          <span className="shrink-0 text-amber-600 dark:text-amber-400">
            {goal.minute}&apos;
          </span>
        </div>
      ))}
    </div>
  );
}

function TeamSide({
  team,
  score,
  goals,
}: {
  team: string;
  score: number;
  goals: WorldCupMatch["goals1"];
}) {
  const flag = getFlagUrl(team);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
      <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        {flag ? (
          <img
            src={flag}
            alt={`${team} flag`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xl">🏳️</span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 min-h-10 text-sm font-bold text-zinc-800 dark:text-zinc-100">
        {team}
      </p>

      <div className="mt-1 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
        {score}
      </div>

      <Scorers goals={goals} />
    </div>
  );
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  matchIndex,
  timeZone,
}) => {
  const id = getMatchId(match, matchIndex);

  /*
   * score.ft = score after 90 minutes
   * score.et = final score after extra time
   *
   * So:
   * - Normal match -> use FT
   * - Extra-time match -> use ET
   *
   * Penalty shootout (score.p) is kept separate because
   * it is not part of the actual match score.
   */
  const finalScore = Array.isArray(match.score.et)
    ? match.score.et : match.score.ft;

  const [homeScore, awayScore] = finalScore;

  const hasExtraTime = Array.isArray(match.score.et);
  const hasPenaltyShootout = Array.isArray(match.score.p);

  return (
    <Link
      href={`/matches/${id}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
    >
      <article className="relative flex h-full min-h-[390px] flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:border-amber-400 group-hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-amber-600 dark:bg-zinc-800 dark:text-amber-400">
            Match #{id}
          </span>

          <span className="truncate">
            {getMatchRoundLabel(match.round)}
          </span>
        </div>

        <div className="my-5 flex items-start justify-between gap-3">
          <TeamSide
            team={match.team1}
            score={homeScore}
            goals={match.goals1}
          />

          <div className="flex shrink-0 flex-col items-center pt-10">
            <span className="text-xs font-black text-zinc-400">
              {hasExtraTime ? "ET" : "FT"}
            </span>

            <span className="mt-1 text-[10px] font-medium text-zinc-400">
              HT {match.score.ht[0]}–{match.score.ht[1]}
            </span>

            {hasExtraTime && (
              <span className="mt-1 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                After Extra Time
              </span>
            )}

            {hasPenaltyShootout && Array.isArray(match.score.p) && (
              <span className="mt-1 text-[9px] font-semibold text-zinc-500 dark:text-zinc-400">
                PEN {match.score.p[0]}–{match.score.p[1]}
              </span>
            )}
          </div>

          <TeamSide
            team={match.team2}
            score={awayScore}
            goals={match.goals2}
          />
        </div>

        <div className="space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              {formatKickoff(match.date, match.time, timeZone)}
            </span>

            <span className="shrink-0 rounded-lg bg-zinc-100 px-2 py-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Details →
            </span>
          </div>

          <p className="truncate text-[11px] text-zinc-400">
            🏟️ {match.ground}
          </p>
        </div>
      </article>
    </Link>
  );
};

