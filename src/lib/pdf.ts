// ── Client-side PDF export using jsPDF + jspdf-autotable ─────────────────
// This runs in the browser only — do NOT import on server side.

import type { MoodEntry } from '$lib/types';
import { formatDate, formatTime, moodColor } from '$lib/utils';

interface ReportOptions {
  username: string;
  displayName: string | null;
  startDate: string;
  endDate: string;
  entries: MoodEntry[];
}

function hex2rgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function moodLabel(r: number | null): string {
  if (r === null) return '—';
  return `${r}/10`;
}

function num(v: number | null): string {
  return v !== null ? String(v) : '—';
}

export async function exportPDF(opts: ReportOptions): Promise<void> {
  // Dynamic import so it doesn't bloat the initial bundle
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const indigo: [number, number, number] = [99, 102, 241];
  const dark:   [number, number, number] = [30, 41, 59];
  const muted:  [number, number, number] = [100, 116, 139];

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(...indigo);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('DMC-VAZIX', 14, 13);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Daily Mood Chart — Therapist Report', 14, 20);

  // User & date range
  doc.setFontSize(9);
  doc.text(`Patient: ${opts.displayName ?? opts.username}  |  Period: ${formatDate(opts.startDate)} — ${formatDate(opts.endDate)}`, 14, 26);

  let y = 36;

  // ── Group entries by date ─────────────────────────────────────────────────
  const byDate: Record<string, MoodEntry[]> = {};
  for (const entry of opts.entries) {
    if (!byDate[entry.entry_date]) byDate[entry.entry_date] = [];
    byDate[entry.entry_date].push(entry);
  }

  const sortedDates = Object.keys(byDate).sort();

  for (const date of sortedDates) {
    const dayEntries = byDate[date];

    // Day header
    const moods = dayEntries.map((e) => e.mood_rating).filter((r): r is number => r !== null);
    const avgMood = moods.length ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length * 10) / 10 : null;
    const minMood = moods.length ? Math.min(...moods) : null;
    const maxMood = moods.length ? Math.max(...moods) : null;
    const sleep = dayEntries.find((e) => e.sleep_hours !== null)?.sleep_hours ?? null;

    // Check page space
    if (y > pageH - 60) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(...dark);
    doc.roundedRect(10, y, pageW - 20, 14, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(date), 14, y + 9);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const summary = [
      avgMood !== null ? `Avg Mood: ${avgMood}` : '',
      minMood !== null ? `Min: ${minMood}` : '',
      maxMood !== null ? `Max: ${maxMood}` : '',
      sleep !== null ? `Sleep: ${sleep}h` : '',
      `Entries: ${dayEntries.length}`
    ].filter(Boolean).join('   ');
    doc.text(summary, pageW - 14, y + 9, { align: 'right' });

    y += 17;

    // Entries table
    const rows = dayEntries.map((e) => [
      formatTime(e.entry_time),
      moodLabel(e.mood_rating),
      num(e.anxiety_rating),
      num(e.energy_rating),
      num(e.stress_rating),
      num(e.pain_rating),
      num(e.sleep_hours),
      e.activity ?? '',
      e.general_note ?? '',
      e.trigger_event ?? '',
      e.medication_note ?? ''
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Time', 'Mood', 'Anx', 'Enrg', 'Str', 'Pain', 'Sleep', 'Activity', 'Note', 'Trigger', 'Medication']],
      body: rows,
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles: {
        0: { cellWidth: 14 },
        1: { cellWidth: 12 },
        2: { cellWidth: 9  },
        3: { cellWidth: 9  },
        4: { cellWidth: 9  },
        5: { cellWidth: 10 },
        6: { cellWidth: 12 },
        7: { cellWidth: 22 },
        8: { cellWidth: 'auto' },
        9: { cellWidth: 22 },
        10: { cellWidth: 22 }
      }
    });

    // @ts-expect-error jspdf-autotable extends doc
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // ── Overall summary ───────────────────────────────────────────────────────
  if (y > pageH - 50) { doc.addPage(); y = 20; }

  const allMoods = opts.entries.map((e) => e.mood_rating).filter((r): r is number => r !== null);
  const overallAvg = allMoods.length ? Math.round(allMoods.reduce((a, b) => a + b, 0) / allMoods.length * 10) / 10 : null;

  doc.setFillColor(99, 102, 241, 0.1);
  doc.setDrawColor(...indigo);
  doc.roundedRect(10, y, pageW - 20, 28, 3, 3, 'FD');

  doc.setTextColor(...indigo);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Summary', 14, y + 8);

  doc.setTextColor(...dark);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const summaryLines = [
    `Total entries: ${opts.entries.length}   Days covered: ${sortedDates.length}   Overall avg mood: ${overallAvg ?? '—'}/10`,
    `Generated: ${new Date().toLocaleString()}   Report by DMC-VAZIX`
  ];
  summaryLines.forEach((line, i) => doc.text(line, 14, y + 15 + i * 7));

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(
      `DMC-VAZIX  ·  ${opts.displayName ?? opts.username}  ·  Page ${p} of ${totalPages}`,
      pageW / 2,
      pageH - 6,
      { align: 'center' }
    );
  }

  const filename = `DMC-VAZIX_${opts.username}_${opts.startDate}_${opts.endDate}.pdf`;
  doc.save(filename);
}
