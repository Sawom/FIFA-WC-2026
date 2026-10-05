"use client";

import { useEffect, useMemo, useState } from "react";
import { getFlagUrl } from "@/lib/utils";
import type { WorldCupMatch } from "@/types/worldcup";

type WorldCupBracketModalProps = {
    open: boolean;
    onClose: () => void;
};

type BracketMatch = {
    id: number;
    team1: string;
    team2: string;
    score1: number | null;
    score2: number | null;
    penalty?: [number, number];
};

const ROW_HEIGHT = 124;
const CARD_HEIGHT = 110;
const CONNECTOR_WIDTH = 56;
const TOTAL_ROWS = 16;

function getFinalScore(
    match: WorldCupMatch
): [number, number] | [null, null] {
    if (Array.isArray(match.score?.et)) {
        return [match.score.et[0], match.score.et[1]];
    }

    if (Array.isArray(match.score?.ft)) {
        return [match.score.ft[0], match.score.ft[1]];
    }

    return [null, null];
}

function getWinner(match: WorldCupMatch): string | null {
    const [score1, score2] = getFinalScore(match);

    if (score1 === null || score2 === null) {
        return null;
    }

    if (score1 > score2) {
        return match.team1;
    }

    if (score2 > score1) {
        return match.team2;
    }

    if (Array.isArray(match.score?.p)) {
        if (match.score.p[0] > match.score.p[1]) {
            return match.team1;
        }

        if (match.score.p[1] > match.score.p[0]) {
            return match.team2;
        }
    }

    return null;
}

function getMatchNumber(
    matches: WorldCupMatch[],
    match: WorldCupMatch
) {
    return matches.indexOf(match) + 1;
}

function convertMatch(
    matches: WorldCupMatch[],
    match: WorldCupMatch
): BracketMatch {
    const [score1, score2] = getFinalScore(match);

    return {
        id: getMatchNumber(matches, match),
        team1: match.team1,
        team2: match.team2,
        score1,
        score2,
        penalty: Array.isArray(match.score?.p)
            ? [match.score.p[0], match.score.p[1]]
            : undefined,
    };
}

function findMatchByWinner(
    matches: WorldCupMatch[],
    team: string
): WorldCupMatch | undefined {
    return matches.find(
        (match) => getWinner(match) === team
    );
}

function buildBracket(matches: WorldCupMatch[]) {
    const round32 = matches.filter(
        (match) => match.round === "Round of 32"
    );

    const round16 = matches.filter(
        (match) => match.round === "Round of 16"
    );

    const quarterFinals = matches.filter(
        (match) => match.round === "Quarter-final"
    );

    const semiFinals = matches.filter(
        (match) => match.round === "Semi-final"
    );

    const finalMatch = matches.find(
        (match) => match.round === "Final"
    );

    const bronzeFinal = matches.find(
        (match) => match.round === "Bronze final"
    );

    if (
        !finalMatch ||
        semiFinals.length === 0 ||
        quarterFinals.length === 0 ||
        round16.length === 0 ||
        round32.length === 0
    ) {
        return {
            round32: [],
            round16: [],
            quarter: [],
            semi: [],
            final: [],
            bronze: null,
        };
    }

    const finalSemiMatches = [
        findMatchByWinner(semiFinals, finalMatch.team1),
        findMatchByWinner(semiFinals, finalMatch.team2),
    ].filter(Boolean) as WorldCupMatch[];

    const finalQuarterMatches: WorldCupMatch[] = [];
    finalSemiMatches.forEach((semi) => {
        const first = findMatchByWinner(quarterFinals, semi.team1);
        const second = findMatchByWinner(quarterFinals, semi.team2);
        if (first) finalQuarterMatches.push(first);
        if (second) finalQuarterMatches.push(second);
    });

    const finalRound16Matches: WorldCupMatch[] = [];
    finalQuarterMatches.forEach((quarter) => {
        const first = findMatchByWinner(round16, quarter.team1);
        const second = findMatchByWinner(round16, quarter.team2);
        if (first) finalRound16Matches.push(first);
        if (second) finalRound16Matches.push(second);
    });

    const finalRound32Matches: WorldCupMatch[] = [];
    finalRound16Matches.forEach((r16) => {
        const first = findMatchByWinner(round32, r16.team1);
        const second = findMatchByWinner(round32, r16.team2);
        if (first) finalRound32Matches.push(first);
        if (second) finalRound32Matches.push(second);
    });

    return {
        round32: finalRound32Matches.map((match) => convertMatch(matches, match)),
        round16: finalRound16Matches.map((match) => convertMatch(matches, match)),
        quarter: finalQuarterMatches.map((match) => convertMatch(matches, match)),
        semi: finalSemiMatches.map((match) => convertMatch(matches, match)),
        final: [convertMatch(matches, finalMatch)],
        bronze: bronzeFinal ? convertMatch(matches, bronzeFinal) : null,
    };
}

function TeamFlag({ team }: { team: string }) {
    const flag = getFlagUrl(team);

    if (!flag) {
        return (
            <div className="flex h-7 w-9 shrink-0 items-center justify-center rounded bg-zinc-100 text-sm dark:bg-zinc-800">
                🏳️
            </div>
        );
    }

    return (
        <img
            src={flag}
            alt={`${team} flag`}
            className="h-7 w-9 shrink-0 rounded object-cover shadow-sm"
        />
    );
}

function MatchBox({ match }: { match: BracketMatch }) {
    const winner =
        match.score1 !== null && match.score2 !== null
            ? match.score1 > match.score2
                ? 1
                : match.score2 > match.score1
                    ? 2
                    : match.penalty
                        ? match.penalty[0] > match.penalty[1]
                            ? 1
                            : 2
                        : null
            : null;

    return (
        <div
            className="
                flex
                w-[250px]
                flex-col
                justify-between
                overflow-hidden
                rounded-xl
                border
                border-zinc-200/90
                bg-white
                p-1.5
                shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                transition-all
                hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]
                dark:border-zinc-800
                dark:bg-zinc-900
                dark:shadow-none
            "
            style={{
                height: CARD_HEIGHT,
            }}
        >
            <div className="flex flex-col gap-2">
                {/* Team 1 */}
                <div
                    className={`
                        flex
                        h-[32px]
                        items-center
                        justify-between
                        gap-2
                        rounded-xl
                        px-2.5
                        transition-colors
                        ${winner === 1 ? "bg-amber-500/10 dark:bg-amber-500/20" : "bg-zinc-50/50 dark:bg-zinc-800/40"}
                    `}
                >
                    <div className="flex min-w-0 items-center gap-2">
                        <TeamFlag team={match.team1} />
                        <span
                            className={`
                                truncate
                                text-sm
                                ${winner === 1
                                    ? "font-black text-zinc-950 dark:text-white"
                                    : "font-medium text-zinc-700 dark:text-zinc-300"
                                }
                            `}
                        >
                            {match.team1}
                        </span>
                    </div>

                    <span
                        className={`
                            text-sm
                            ${winner === 1
                                ? "font-black text-amber-600 dark:text-amber-400"
                                : "font-bold text-zinc-700 dark:text-zinc-300"
                            }
                        `}
                    >
                        {match.score1 ?? "–"}
                    </span>
                </div>

                {/* Team 2 */}
                <div
                    className={`
                        flex
                        h-[32px]
                        items-center
                        justify-between
                        gap-2
                        rounded-xl
                        px-2.5
                        transition-colors
                        ${winner === 2 ? "bg-amber-500/10 dark:bg-amber-500/20" : "bg-zinc-50/50 dark:bg-zinc-800/40"}
                    `}
                >
                    <div className="flex min-w-0 items-center gap-2">
                        <TeamFlag team={match.team2} />
                        <span
                            className={`
                                truncate
                                text-sm
                                ${winner === 2
                                    ? "font-black text-zinc-950 dark:text-white"
                                    : "font-medium text-zinc-700 dark:text-zinc-300"
                                }
                            `}
                        >
                            {match.team2}
                        </span>
                    </div>

                    <span
                        className={`
                            text-sm
                            ${winner === 2
                                ? "font-black text-amber-600 dark:text-amber-400"
                                : "font-bold text-zinc-700 dark:text-zinc-300"
                            }
                        `}
                    >
                        {match.score2 ?? "–"}
                    </span>
                </div>

            </div>

            {/* Penalty Tag - Cleanly integrated at the bottom without overlap */}
            {match.penalty && (
                <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/10 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                    <span>PEN</span>
                    <span>{match.penalty[0]} – {match.penalty[1]}</span>
                </div>
            )}
        </div>

    );
}

function BracketConnector({
    index,
    prevSpan,
}: {
    index: number;
    prevSpan: number;
}) {
    const pairSpan = prevSpan * 2;
    const firstCenter = (index * pairSpan + prevSpan / 2) * ROW_HEIGHT;
    const secondCenter = (index * pairSpan + prevSpan + prevSpan / 2) * ROW_HEIGHT;
    const nextCenter = (firstCenter + secondCenter) / 2;

    return (
        <svg
            className="pointer-events-none absolute left-0 top-0"
            width={CONNECTOR_WIDTH}
            height={TOTAL_ROWS * ROW_HEIGHT}
            viewBox={`0 0 ${CONNECTOR_WIDTH} ${TOTAL_ROWS * ROW_HEIGHT}`}
            fill="none"
            aria-hidden="true"
        >
            <line
                x1="0"
                y1={firstCenter}
                x2={CONNECTOR_WIDTH / 2}
                y2={firstCenter}
                className="stroke-zinc-300 dark:stroke-zinc-700"
                strokeWidth="1.5"
            />
            <line
                x1="0"
                y1={secondCenter}
                x2={CONNECTOR_WIDTH / 2}
                y2={secondCenter}
                className="stroke-zinc-300 dark:stroke-zinc-700"
                strokeWidth="1.5"
            />
            <line
                x1={CONNECTOR_WIDTH / 2}
                y1={firstCenter}
                x2={CONNECTOR_WIDTH / 2}
                y2={secondCenter}
                className="stroke-zinc-300 dark:stroke-zinc-700"
                strokeWidth="1.5"
            />
            <line
                x1={CONNECTOR_WIDTH / 2}
                y1={nextCenter}
                x2={CONNECTOR_WIDTH}
                y2={nextCenter}
                className="stroke-zinc-300 dark:stroke-zinc-700"
                strokeWidth="1.5"
            />
        </svg>
    );
}

function BracketColumn({
    title,
    matches,
    span,
}: {
    title: string;
    matches: BracketMatch[];
    span: number;
}) {
    return (
        <div
            className="relative shrink-0"
            style={{
                width: 250,
                height: TOTAL_ROWS * ROW_HEIGHT,
            }}
        >
            <div className="absolute -top-10 left-0 right-0 text-center">
                <h3 className="text-[12px] font-black uppercase tracking-[0.18em] text-zinc-600 dark:text-zinc-400">
                    {title}
                </h3>
            </div>

            {matches.map((match, index) => {
                const top =
                    (index * span + span / 2) * ROW_HEIGHT - CARD_HEIGHT / 2;

                return (
                    <div
                        key={match.id}
                        className="absolute left-0"
                        style={{ top }}
                    >
                        <MatchBox match={match} />
                    </div>
                );
            })}
        </div>
    );
}

function ConnectorColumn({
    count,
    prevSpan,
}: {
    count: number;
    prevSpan: number;
}) {
    return (
        <div
            className="relative shrink-0"
            style={{
                width: CONNECTOR_WIDTH,
                height: TOTAL_ROWS * ROW_HEIGHT,
            }}
        >
            {Array.from({ length: count }).map((_, index) => (
                <BracketConnector
                    key={index}
                    index={index}
                    prevSpan={prevSpan}
                />
            ))}
        </div>
    );
}

export default function WorldCupBracketModal({
    open,
    onClose,
}: WorldCupBracketModalProps) {
    const [matches, setMatches] = useState<WorldCupMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open) return;

        setLoading(true);

        fetch("/data/worldcup-full.json")
            .then((response) => response.json())
            .then((data) => {
                setMatches(
                    Array.isArray(data?.matches) ? data.matches : []
                );
            })
            .catch((error) => {
                console.error(
                    "Failed to load World Cup bracket:",
                    error
                );
                setMatches([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    const bracket = useMemo(
        () => buildBracket(matches),
        [matches]
    );

    if (!open) return null;

    return (
        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/60
                p-3
                backdrop-blur-sm
                md:p-6
            "
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="
                    relative
                    flex
                    max-h-[94vh]
                    w-full
                    max-w-[1850px]
                    flex-col
                    overflow-hidden
                    rounded-[1rem]
                    border
                    border-zinc-200
                    bg-zinc-50
                    shadow-2xl
                    dark:border-zinc-800
                    dark:bg-zinc-950
                "
            >
                {/* Header */}
                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        border-zinc-200
                        bg-white
                        px-6
                        py-4
                        dark:border-zinc-800
                        dark:bg-zinc-900
                    "
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-xl text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                            🏆
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white md:text-2xl">
                                World Cup 2026
                            </h2>
                            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                                Knockout Stage Bracket
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            cursor-pointer
                            rounded-xl
                            border
                            border-zinc-200
                            bg-zinc-50
                            text-xl
                            font-bold
                            text-zinc-500
                            transition
                            hover:border-amber-500
                            hover:text-amber-600
                            dark:border-zinc-800
                            dark:bg-zinc-800
                            dark:text-zinc-400
                            dark:hover:border-amber-500
                            dark:hover:text-amber-400
                        "
                        aria-label="Close bracket"
                    >
                        ×
                    </button>
                </div>

                {/* Main bracket area */}
                <div className="min-h-0 flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex min-h-[500px] items-center justify-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                        </div>
                    ) : bracket.final.length === 0 ? (
                        <div className="flex min-h-[500px] items-center justify-center px-5">
                            <div className="text-center">
                                <p className="text-lg font-black">
                                    Bracket data unavailable
                                </p>
                                <p className="mt-2 text-sm text-zinc-500">
                                    Could not build the knockout bracket from the dataset.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 md:p-16">
                            <div className="relative mx-auto w-max pt-10">
                                <div className="flex items-start">
                                    {/* ROUND OF 32 */}
                                    <BracketColumn
                                        title="Round of 32"
                                        matches={bracket.round32}
                                        span={1}
                                    />

                                    <ConnectorColumn count={8} prevSpan={1} />

                                    {/* ROUND OF 16 */}
                                    <BracketColumn
                                        title="Round of 16"
                                        matches={bracket.round16}
                                        span={2}
                                    />

                                    <ConnectorColumn count={4} prevSpan={2} />

                                    {/* QUARTER FINAL */}
                                    <BracketColumn
                                        title="Quarter-final"
                                        matches={bracket.quarter}
                                        span={4}
                                    />

                                    <ConnectorColumn count={2} prevSpan={4} />

                                    {/* SEMI FINAL */}
                                    <BracketColumn
                                        title="Semi-final"
                                        matches={bracket.semi}
                                        span={8}
                                    />

                                    <ConnectorColumn count={1} prevSpan={8} />

                                    {/* FINAL */}
                                    <div
                                        className="relative shrink-0 mr-8"
                                        style={{
                                            width: 270,
                                            height: TOTAL_ROWS * ROW_HEIGHT,
                                        }}
                                    >
                                        <div className="absolute -top-10 left-0 right-0 text-center">
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
                                                Final
                                            </h3>
                                        </div>

                                        <div
                                            className="absolute left-0 w-[270px]"
                                            style={{
                                                top:
                                                    (TOTAL_ROWS * ROW_HEIGHT -
                                                        CARD_HEIGHT) /
                                                    2,
                                            }}
                                        >
                                            <div className="rounded border-1 border-amber-400/60  p-2 shadow-[0_10px_30px_rgba(245,158,11,0.15)] dark:border-amber-500/40 dark:bg-zinc-900">
                                                <MatchBox
                                                    match={bracket.final[0]}
                                                />
                                            </div>

                                            {/* Champion */}
                                            {bracket.final[0] && (() => {
                                                const finalMatch = matches.find((m) => m.round === "Final");
                                                const winnerName = finalMatch ? getWinner(finalMatch) : null;

                                                return (
                                                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-center shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <span className="text-base">🏆</span>
                                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
                                                                Champion
                                                            </p>
                                                        </div>

                                                        <div className="mt-2 flex items-center justify-center gap-2">
                                                            {winnerName ? (
                                                                <>
                                                                    <TeamFlag team={winnerName} />
                                                                    <span className="text-base font-black text-zinc-900 dark:text-white">
                                                                        {winnerName}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-base font-black text-zinc-400">
                                                                    —
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}