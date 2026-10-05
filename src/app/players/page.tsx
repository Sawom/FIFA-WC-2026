
"use client";

import { useEffect, useMemo, useState } from "react";

type Player = {
    number: number;
    pos: "GK" | "DF" | "MF" | "FW";
    name: string;
    club: {
        name: string;
        country: string;
    };
    date_of_birth: string;
};

type Squad = {
    name: string;
    fifa_code: string;
    group: string;
    players: Player[];
};

const positionLabels: Record<Player["pos"], string> = {
    GK: "Goalkeeper",
    DF: "Defender",
    MF: "Midfielder",
    FW: "Forward",
};


function getFlagUrl(code: string) {
    const flagCodes: Record<string, string> = {
        ARG: "ar",
        AUS: "au",
        AUT: "at",
        BEL: "be",
        BRA: "br",
        CAN: "ca",
        COL: "co",
        CRC: "cr",
        CRO: "hr",
        CZE: "cz",
        DEN: "dk",
        ECU: "ec",
        EGY: "eg",
        ENG: "gb-eng",
        FRA: "fr",
        GER: "de",
        GHA: "gh",
        HAI: "ht",
        IRN: "ir",
        JPN: "jp",
        KOR: "kr",
        KSA: "sa",
        MEX: "mx",
        MAR: "ma",
        NED: "nl",
        NZL: "nz",
        NGA: "ng",
        PAN: "pa",
        PAR: "py",
        PER: "pe",
        POL: "pl",
        POR: "pt",
        QAT: "qa",
        SCO: "gb-sct",
        SEN: "sn",
        SRB: "rs",
        SUI: "ch",
        TUN: "tn",
        URU: "uy",
        USA: "us",
        WAL: "gb-wls",
    };

    const countryCode = flagCodes[code.toUpperCase()];

    // Never return an empty string
    if (!countryCode) {
        return null;
    }

    return `https://flagcdn.com/w80/${countryCode}.png`;
}



function calculateAge(dateOfBirth: string) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
}

export default function PlayersPage() {
    const [squads, setSquads] = useState<Squad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("All");

    useEffect(() => {
        const loadSquads = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/data/worldcup.squads.json");

                if (!response.ok) {
                    throw new Error("Failed to load squad data");
                }

                const data: Squad[] = await response.json();

                setSquads(data);
            } catch (error) {
                console.error("Failed to load squads:", error);
                setError("Failed to load World Cup squad data.");
            } finally {
                setLoading(false);
            }
        };

        loadSquads();
    }, []);

    const groups = useMemo(() => {
        return [
            "All",
            ...Array.from(new Set(squads.map((squad) => squad.group))).sort(),
        ];
    }, [squads]);

    const filteredSquads = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return squads
            .filter((squad) => {
                if (selectedGroup === "All") return true;

                return squad.group === selectedGroup;
            })
            .map((squad) => {
                if (!searchValue) {
                    return squad;
                }

                const countryMatches =
                    squad.name.toLowerCase().includes(searchValue) ||
                    squad.fifa_code.toLowerCase().includes(searchValue);

                const filteredPlayers = squad.players.filter((player) => {
                    return (
                        player.name.toLowerCase().includes(searchValue) ||
                        player.club.name.toLowerCase().includes(searchValue) ||
                        player.club.country.toLowerCase().includes(searchValue) ||
                        player.pos.toLowerCase().includes(searchValue)
                    );
                });

                if (countryMatches) {
                    return squad;
                }

                return {
                    ...squad,
                    players: filteredPlayers,
                };
            })
            .filter((squad) => {
                if (!searchValue) return true;

                return (
                    squad.name.toLowerCase().includes(searchValue) ||
                    squad.fifa_code.toLowerCase().includes(searchValue) ||
                    squad.players.length > 0
                );
            });
    }, [squads, selectedGroup, search]);

    const totalPlayers = squads.reduce(
        (total, squad) => total + squad.players.length,
        0
    );

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                        <span>⚽</span>
                        FIFA World Cup 2026
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        World Cup Players
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                        Explore the complete squads, positions, clubs and player details
                        for all participating teams.
                    </p>
                </div>

                {/* Stats */}
                {!loading && !error && (
                    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Countries
                            </p>

                            <p className="mt-1 text-2xl font-bold">{squads.length}</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Players
                            </p>

                            <p className="mt-1 text-2xl font-bold">{totalPlayers}</p>
                        </div>

                        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:col-span-1">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Groups
                            </p>

                            <p className="mt-1 text-2xl font-bold">{groups.length - 1}</p>
                        </div>
                    </div>
                )}

                {/* Search + Groups */}
                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4">
                        <label
                            htmlFor="player-search"
                            className="mb-2 block text-sm font-semibold"
                        >
                            Search
                        </label>

                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                🔍
                            </span>

                            <input
                                id="player-search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search country, player or club..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-semibold">Groups</p>

                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {groups.map((group) => {
                                const active = selectedGroup === group;

                                return (
                                    <button
                                        key={group}
                                        type="button"
                                        onClick={() => setSelectedGroup(group)}
                                        className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${active
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                            : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                            }`}
                                    >
                                        {group === "All" ? "All Groups" : `Group ${group}`}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Loading World Cup squads...
                            </p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
                        <div className="mb-2 text-3xl">⚠️</div>

                        <h2 className="font-semibold text-red-700 dark:text-red-400">
                            Unable to load squads
                        </h2>

                        <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && filteredSquads.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-3 text-4xl">🔎</div>

                        <h2 className="font-semibold">No results found</h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Try searching for another country, player or club.
                        </p>
                    </div>
                )}

                {/* Squads */}
                {!loading && !error && filteredSquads.length > 0 && (
                    <div className="space-y-8">
                        {filteredSquads.map((squad) => (
                            <section
                                key={squad.fifa_code}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                            >
                                {/* Country Header */}
                                <div className="border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/60">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                                <img
                                                    src={getFlagUrl(squad.fifa_code) ?? undefined}
                                                    alt={`${squad.name} flag`}
                                                    className="max-h-full max-w-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <h2 className="text-xl font-bold sm:text-2xl">
                                                    {squad.name}
                                                </h2>

                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                    <span>{squad.fifa_code}</span>

                                                    <span>•</span>

                                                    <span>Group {squad.group}</span>

                                                    <span>•</span>

                                                    <span>{squad.players.length} players</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-fit rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                            GROUP {squad.group}
                                        </div>
                                    </div>
                                </div>

                                {/* Players Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px] text-left">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    #
                                                </th>

                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Player
                                                </th>

                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Position
                                                </th>

                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Club
                                                </th>

                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Club Country
                                                </th>

                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Date of Birth
                                                </th>

                                                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    Age
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {squad.players.map((player, index) => (
                                                <tr
                                                    key={`${squad.fifa_code}-${player.number}-${player.name}`}
                                                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-800/40"
                                                >
                                                    <td className="px-5 py-4">
                                                        <span className="font-bold text-slate-400">
                                                            {player.number}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                                {index + 1}
                                                            </div>

                                                            <span className="font-semibold whitespace-nowrap">
                                                                {player.name}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${player.pos === "GK"
                                                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300"
                                                                : player.pos === "DF"
                                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                                                    : player.pos === "MF"
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                                                                        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                                                }`}
                                                        >
                                                            {player.pos}
                                                        </span>

                                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                            {positionLabels[player.pos]}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="whitespace-nowrap text-sm font-medium">
                                                            {player.club.name}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                            {player.club.country}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                                            {player.date_of_birth}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="font-semibold">
                                                            {calculateAge(player.date_of_birth)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile hint */}
                                <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400 sm:hidden">
                                    ← Swipe horizontally to see all player details →
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

