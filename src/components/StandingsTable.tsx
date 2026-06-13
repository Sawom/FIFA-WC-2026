import React from "react";
import { GroupTeam } from "@/types/worldcup";

interface StandingsTableProps {
  teams: GroupTeam[];
  groupName: string;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  teams,
  groupName,
}) => {
  return (
    <div className="mb-10 w-full overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm animate-in fade-in duration-300">
      <div className="bg-zinc-50 dark:bg-zinc-800/50 px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
          Group {groupName} Standings
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-5 py-3 font-medium">Team</th>
              <th className="px-3 py-3 text-center font-medium">MP</th>
              <th className="px-3 py-3 text-center font-medium">W</th>
              <th className="px-3 py-3 text-center font-medium">D</th>
              <th className="px-3 py-3 text-center font-medium">L</th>
              <th className="px-3 py-3 text-center font-medium">GD</th>
              <th className="px-5 py-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                Pts
              </th>
            </tr>
          </thead>
          <tbody>
            {[...teams]
              .sort((a, b) => parseInt(b.pts) - parseInt(a.pts))
              .map((team, idx) => (
                <tr
                  key={team.team_id}
                  className="border-b last:border-0 border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-5 py-3 flex items-center gap-3 font-medium">
                    <span className="text-xs text-zinc-400 w-4">{idx + 1}</span>
                    Team {team.team_id}
                  </td>
                  <td className="px-3 py-3 text-center">{team.mp}</td>
                  <td className="px-3 py-3 text-center">{team.w}</td>
                  <td className="px-3 py-3 text-center">{team.d}</td>
                  <td className="px-3 py-3 text-center">{team.l}</td>
                  <td className="px-3 py-3 text-center text-zinc-400">
                    {team.gd}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-amber-600 dark:text-amber-500">
                    {team.pts}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
