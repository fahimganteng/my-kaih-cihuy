import type { AdminRow, Habit } from './defaults';
import { habitAvgOfRow } from './stats';
import { fmtTime, habitStatements } from './utils';

const csvCell = (v: unknown) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';

/* Mengunduh CSV (satu kolom per pernyataan). Mengembalikan false bila tidak ada data. */
export function exportCSV(rows: AdminRow[], habits: Habit[]): boolean {
    if (!rows.length) return false;

    const head = ['Waktu Input', 'Nama Siswa', 'Nomor Absen', 'Kelas', 'Tanggal'];
    habits.forEach(h => habitStatements(h).forEach((_, si) => head.push(`${h.short_label || h.name} #${si + 1}`)));
    habits.forEach(h => head.push(`Rata-rata ${h.short_label || h.name}`));
    head.push('Rata-Rata Skor');

    const lines = [head.map(csvCell).join(',')];
    rows.forEach(r => {
        const cells: unknown[] = [fmtTime(r.created_at), r.nama, r.absen, r.kelas, r.tanggal];
        habits.forEach((h, hi) => habitStatements(h).forEach((_, si) => {
            const v = r.scores && r.scores[hi] ? r.scores[hi][si] : '';
            cells.push(v == null ? '' : v);
        }));
        const per = habits.map((_, i) => habitAvgOfRow(r.scores, i));
        per.forEach(v => cells.push(v === null ? '' : v.toFixed(2)));
        const valid = per.filter((v): v is number => v !== null);
        cells.push(valid.length ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2) : '');
        lines.push(cells.map(csvCell).join(','));
    });

    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Data_NEXARA_7KAIH_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    return true;
}
