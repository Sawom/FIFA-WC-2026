import React from "react";
import { WorldCupMatch } from "@/types/worldcup";
import { getFlagUrl } from "@/lib/utils";

interface Standing {
  team: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export function calculateGroupStandings(matches: WorldCupMatch[], group: string): Standing[] {
  const groupMatches = matches.filter(
    (match) => match.round === `First Stage, Group ${group}`
  );

  const table = new Map<string, Standing>();

  const getRow = (team: string) => {
    if (!table.has(team)) {
      table.set(team, { team, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
    }
    return table.get(team)!;
  };

  groupMatches.forEach((match) => {
    const [homeGoals, awayGoals] = match.score.ft;
    const home = getRow(match.team1);
    const away = getRow(match.team2);

    home.mp += 1;
    away.mp += 1;
    home.gf += homeGoals;
    home.ga += awayGoals;
    away.gf += awayGoals;
    away.ga += homeGoals;

    if (homeGoals > awayGoals) {
      home.w += 1;
      home.pts += 3;
      away.l += 1;
    } else if (homeGoals < awayGoals) {
      away.w += 1;
      away.pts += 3;
      home.l += 1;
    } else {
      home.d += 1;
      away.d += 1;
      home.pts += 1;
      away.pts += 1;
    }
  });

  return [...table.values()]
    .map((row) => ({ ...row, gd: row.gf - row.ga }))
    .sort(
      (a, b) =>
        b.pts - a.pts ||
        b.gd - a.gd ||
        b.gf - a.gf ||
        a.team.localeCompare(b.team)
    );
}

interface Props {
  matches: WorldCupMatch[];
  group: string;
}

export const StandingsTable: React.FC<Props> = ({ matches, group }) => {
  const teams = calculateGroupStandings(matches, group);

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/70">
        <h2 className="font-black text-zinc-900 dark:text-white">
          Group {group} Standings
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Calculated from the match results in the supplied dataset.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-sm">
          <thead className="bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3 text-center">Pos</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-3 py-3 text-center">MP</th>
              <th className="px-3 py-3 text-center">W</th>
              <th className="px-3 py-3 text-center">D</th>
              <th className="px-3 py-3 text-center">L</th>
              <th className="px-3 py-3 text-center">GD</th>
              <th className="px-4 py-3 text-center">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {teams.map((team, index) => {
              const flag = getFlagUrl(team.team);
              return (
                <tr key={team.team} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-4 text-center font-bold text-zinc-400">{index + 1}</td>
                  <td className="px-4 py-4 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-8 overflow-hidden rounded border border-zinc-200 dark:border-zinc-700">
                        {flag && <img src={flag} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <span>{team.team}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center">{team.mp}</td>
                  <td className="px-3 py-4 text-center">{team.w}</td>
                  <td className="px-3 py-4 text-center">{team.d}</td>
                  <td className="px-3 py-4 text-center">{team.l}</td>
                  <td className={`px-3 py-4 text-center font-semibold ${team.gd > 0 ? "text-emerald-600" : team.gd < 0 ? "text-red-500" : "text-zinc-500"}`}>
                    {team.gd > 0 ? `+${team.gd}` : team.gd}
                  </td>
                  <td className="bg-amber-50/50 px-4 py-4 text-center font-black text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                    {team.pts}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
