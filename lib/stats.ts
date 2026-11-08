/* Statistik skala 0-4 (dipakai di Beranda dan Laman Admin) */
import type { Habit, ScoreRow } from './defaults';
import { localToday } from './utils';

export function habitAvgOfRow(scores: ScoreRow['scores'] | undefined, hi: number): number | null {
    const arr = scores && scores[hi];
    if (!Array.isArray(arr)) return null;
    const v = arr.map(Number).filter(Number.isFinite);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

export type Stats = {
    n: number;
    habitMeans: number[];
    overall: number;
    overallPct: number;
    tiers: number[];
    topIdx: number;
    todayCount: number;
};

export function computeStats(rows: ScoreRow[], habits: Habit[]): Stats {
    const n = rows.length;
    const hc = habits.length;
    const sums: number[] = new Array(hc).fill(0);
    const counts: number[] = new Array(hc).fill(0);
    const tiers = [0, 0, 0]; // >=3 sangat konsisten, >=2 cukup, <2 perlu ditingkatkan
    const today = localToday();
    let todayCount = 0;

    rows.forEach(r => {
        const per: number[] = [];
        for (let i = 0; i < hc; i++) {
            const a = habitAvgOfRow(r.scores, i);
            if (a !== null) { sums[i] += a; counts[i]++; per.push(a); }
        }
        const sAvg = per.length ? per.reduce((a, b) => a + b, 0) / per.length : 0;
        if (sAvg >= 3) tiers[0]++; else if (sAvg >= 2) tiers[1]++; else tiers[2]++;
        if (r.tanggal === today) todayCount++;
    });

    const habitMeans = sums.map((s, i) => (counts[i] ? s / counts[i] : 0));
    const overall = n ? habitMeans.reduce((a, b) => a + b, 0) / hc : 0;
    let topIdx = -1;
    if (n) { let mx = -1; habitMeans.forEach((v, i) => { if (v > mx) { mx = v; topIdx = i; } }); }

    return { n, habitMeans, overall, overallPct: Math.round(overall / 4 * 100), tiers, topIdx, todayCount };
}
