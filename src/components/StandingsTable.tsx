import React from "react";

interface ApiTeamItem {
  id: string | number;
  name_en: string;
  flag: string;
  fifa_code?: string;
}

interface TeamStanding {
  team_id: string | number; // 'team_id' is coming from the API, so the type has been updated.
  mp: string | number;
  w: string | number;
  d: string | number;
  l: string | number;
  gd: string | number;
  pts: string | number;
}

interface StandingsTableProps {
  teams: TeamStanding[];
  groupName: string;
  allTeamsData: ApiTeamItem[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  teams = [],
  groupName,
  allTeamsData = [],
}) => {
  // Separating only "A" from "Group A"
  const cleanGroupLetter = groupName.replace("Group ", "").trim();

  return (
    <div className="mb-10 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <h3 className="font-bold text-zinc-800 dark:text-zinc-100">
          Group {cleanGroupLetter} Standings
        </h3>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-semibold text-zinc-600 uppercase bg-zinc-50/50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-3 w-16 text-center">Pos</th>
              <th className="px-6 py-3">Team</th>
              <th className="px-4 py-3 text-center">Match Played</th>
              <th className="px-4 py-3 text-center">Win</th>
              <th className="px-4 py-3 text-center">Draw</th>
              <th className="px-4 py-3 text-center">Lost</th>
              <th className="px-4 py-3 text-center">Goal Difference</th>
              <th className="px-6 py-3 text-center">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {teams.map((team, index) => {
              // 1. Convert the team_id from the API to a string and trim it (e.g. "1")
              const currentTeamId = team.team_id
                ? String(team.team_id).trim()
                : "";

              // 2. Finding matching objects from all team data in /get/teams
              const matchedTeam = allTeamsData.find((t) => {
                if (!t) return false;
                const apiTeamId = t.id ? String(t.id).trim() : "";
                return apiTeamId === currentTeamId;
              });

              // 3. If a matching team is found, its original name and flag will be displayed, otherwise a fallback will be shown.
              const countryName = matchedTeam
                ? matchedTeam.name_en
                : `Team ${currentTeamId}`;
              const flagUrl = matchedTeam ? matchedTeam.flag : null;

              return (
                <tr
                  key={index}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-center font-medium text-zinc-400">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
                        {flagUrl ? (
                          <img
                            src={flagUrl}
                            alt={countryName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px]">🏳️</span>
                        )}
                      </div>
                      <span className="truncate">{countryName}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center font-medium dark:text-zinc-300">
                    {team.mp}
                  </td>
                  <td className="px-4 py-4 text-center dark:text-zinc-400">
                    {team.w}
                  </td>
                  <td className="px-4 py-4 text-center dark:text-zinc-400">
                    {team.d}
                  </td>
                  <td className="px-4 py-4 text-center dark:text-zinc-400">
                    {team.l}
                  </td>
                  <td
                    className={`px-4 py-4 text-center font-medium ${Number(team.gd) > 0 ? "text-emerald-600 dark:text-emerald-500" : Number(team.gd) < 0 ? "text-red-500" : "dark:text-zinc-400"}`}
                  >
                    {Number(team.gd) > 0 ? `+${team.gd}` : team.gd}
                  </td>
                  <td className="px-6 py-4 text-center font-black text-amber-600 dark:text-amber-500 bg-amber-50/20 dark:bg-amber-950/10">
                    {team.pts}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
