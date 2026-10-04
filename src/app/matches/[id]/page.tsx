"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "next/navigation";
import { WorldCupMatch } from "@/types/worldcup";
import {
    formatDate,
    formatKickoff,
    getFlagUrl,
    getMatchRoundLabel,
} from "@/lib/utils";

function TeamHeader({ team, score, goals }: { team: string; score: number; goals: WorldCupMatch["goals1"] }) {
    const flag = getFlagUrl(team);
    const safeGoals = Array.isArray(goals) ? goals : [];

    return (
        <div className="flex flex-1 flex-col items-center text-center">
            <div className="h-20 w-28 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
                {flag ? (
                    <img src={flag} alt={`${team} flag`} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🏳️</div>
                )}
            </div>
            <h2 className="mt-4 text-lg font-black md:text-2xl">{team}</h2>
            <div className="mt-2 text-5xl font-black tracking-tight text-amber-600 dark:text-amber-400">{score}</div>
            <div className="mt-3 flex flex-col gap-1">
                {safeGoals.length ? safeGoals.map((goal, index) => (
                    <div key={`${goal.name}-${goal.minute}-${index}`} className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        ⚽ {goal.name} <span className="text-amber-600 dark:text-amber-400">{goal.minute}&apos;</span>
                        {goal.penalty ? " • PEN" : ""}
                        {goal.owngoal ? " • OG" : ""}
                    </div>
                )) : <span className="text-xs text-zinc-400">No goals</span>}
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <h2 className="font-black">{title}</h2>
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

function PlayerList({ title, players }: { title: string; players: { name: string; captain?: boolean }[] }) {
    return (
        <div>
            <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-zinc-400">{title}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
                {players.map((player, index) => (
                    <div key={`${player.name}-${index}`} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/70">
                        <span className="text-sm font-semibold">{player.name}</span>
                        {player.captain && <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-700 dark:bg-amber-950 dark:text-amber-300">C</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MatchDetailsPage() {
    const params = useParams<{ id: string }>();
    const [matches, setMatches] = useState<WorldCupMatch[]>([]);
    const [timeZone] = useState("Asia/Dhaka");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.documentElement.classList.toggle(
            "dark",
            localStorage.getItem("theme") === "dark"
        );

        fetch("/data/worldcup-full.json")
            .then((response) => response.json())
            .then((data) => setMatches(data.matches ?? []))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    const match = useMemo(() => {
        const index = Number(params.id) - 1;
        return Number.isInteger(index) && index >= 0 ? matches[index] : undefined;
    }, [matches, params.id]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950"><div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" /></div>;
    }

    if (!match) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
                <div className="text-center">
                    <h1 className="text-3xl font-black">Match not found</h1>
                    <Link href="/" className="mt-4 inline-block rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black">← Back to matches</Link>
                </div>
            </main>
        );
    }

    const [homeScore, awayScore] = match.score.ft;

    return (
        <main className="min-h-screen bg-zinc-50 pb-20 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
            <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
                <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:border-amber-500 dark:border-zinc-800 dark:bg-zinc-900">
                    ← All Matches
                </Link>

                <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-4 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
                        <p className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                            Match #{params.id} • {getMatchRoundLabel(match.round)}
                        </p>
                        <p className="mt-2 text-sm text-zinc-500">{formatKickoff(match.date, match.time, timeZone)}</p>
                    </div>

                    <div className="grid gap-8 px-5 py-10 md:grid-cols-[1fr_auto_1fr] md:items-start md:px-12">
                        <TeamHeader team={match.team1} score={homeScore} goals={match.goals1} />

                        <div className="flex flex-col items-center justify-center pt-4">
                            <span className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-black text-zinc-500 dark:bg-zinc-800">
                                FULL TIME
                            </span>
                            <span className="mt-3 text-sm font-bold text-zinc-400">
                                Half Time {match.score.ht[0]} – {match.score.ht[1]}
                            </span>
                        </div>

                        <TeamHeader team={match.team2} score={awayScore} goals={match.goals2} />
                    </div>
                </section>

                <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                        <p className="text-xs font-bold uppercase text-zinc-400">Date</p>
                        <p className="mt-2 font-bold">{formatDate(match.date)}</p>
                    </div>
                    <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                        <p className="text-xs font-bold uppercase text-zinc-400">Stadium</p>
                        <p className="mt-2 font-bold">{match.ground}</p>
                    </div>
                    <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                        <p className="text-xs font-bold uppercase text-zinc-400">Attendance</p>
                        <p className="mt-2 font-bold">{match.attendance.toLocaleString()}</p>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <Section title="Goals">
                        <div className="space-y-3">
                            {[
                                Array.isArray(match.goals1) ? match.goals1 : [],
                                Array.isArray(match.goals2) ? match.goals2 : [],
                            ].map((goals, teamIndex) => (
                                <div key={teamIndex}>
                                    <p className="mb-2 text-xs font-black uppercase text-zinc-400">
                                        {teamIndex === 0 ? match.team1 : match.team2}
                                    </p>
                                    {goals.length ? goals.map((goal, index) => (
                                        <div key={`${goal.name}-${index}`} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/70">
                                            <span className="font-semibold">⚽ {goal.name}</span>
                                            <span className="text-xs font-black text-amber-600 dark:text-amber-400">{goal.minute}&apos;{goal.penalty ? " • PEN" : ""}{goal.owngoal ? " • OG" : ""}</span>
                                        </div>
                                    )) : <p className="text-sm text-zinc-400">No goals</p>}
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="Officials & Match Info">
                        <div className="space-y-3">
                            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/70">
                                <p className="text-xs text-zinc-400">Referees</p>
                                {Array.isArray(match.referees) && match.referees.length ? match.referees.map((referee, index) => (
                                    <p key={`${referee.name}-${index}`} className="mt-1 font-bold">{referee.name} <span className="text-xs text-zinc-400">({referee.country})</span></p>
                                )) : <p className="mt-1 text-sm text-zinc-400">Not listed</p>}
                            </div>
                            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/70">
                                <p className="text-xs text-zinc-400">Kickoff source time</p>
                                <p className="mt-1 font-bold">{match.time}</p>
                            </div>
                        </div>
                    </Section>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    {[0, 1].map((teamIndex) => {
                        const team = teamIndex === 0 ? match.team1 : match.team2;
                        const lineup = match.lineup?.[teamIndex] ?? { starter: [], bench: [], subs: [] };
                        return (
                            <Section key={team} title={`${team} Lineup`}>
                                <div className="space-y-6">
                                    <PlayerList title="Starting XI" players={lineup.starter} />
                                    <PlayerList title="Bench" players={lineup.bench} />

                                    <div>
                                        <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-zinc-400">Substitutions</h3>
                                        <div className="space-y-2">
                                            {Array.isArray(lineup.subs) && lineup.subs.length ? lineup.subs.map((sub, index) => (
                                                <div key={`${sub.on}-${sub.off}-${index}`} className="rounded-xl bg-zinc-50 px-3 py-3 text-sm dark:bg-zinc-800/70">
                                                    <span className="font-bold text-emerald-600">↑ {sub.on}</span>
                                                    <span className="mx-2 text-zinc-400">for</span>
                                                    <span className="font-semibold text-red-500">↓ {sub.off}</span>
                                                    <span className="float-right font-black text-amber-600 dark:text-amber-400">{sub.minute}&apos;</span>
                                                </div>
                                            )) : <p className="text-sm text-zinc-400">No substitutions</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-zinc-400">Bookings</h3>
                                        <div className="space-y-2">
                                            {Array.isArray(match.bookings?.[teamIndex]) && match.bookings[teamIndex]!.length ? match.bookings[teamIndex]!.map((card, index) => (
                                                <div key={`${card.name}-${card.minute}-${index}`} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-3 text-sm dark:bg-zinc-800/70">
                                                    <span className="font-semibold">{card.name}</span>
                                                    <span className="flex items-center gap-2 font-black">
                                                        <span className={`h-5 w-4 rounded-sm ${card.type === "R" ? "bg-red-500" : "bg-yellow-400"}`} />
                                                        {card.minute}&apos;
                                                    </span>
                                                </div>
                                            )) : <p className="text-sm text-zinc-400">No bookings</p>}
                                        </div>
                                    </div>
                                </div>
                            </Section>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
