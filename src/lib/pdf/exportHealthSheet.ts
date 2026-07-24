import jsPDF from 'jspdf';

import i18n from '@/i18n';
import type { Checkin } from '@/lib/supabase/queries/checkins';
import type { HealthEvent } from '@/lib/supabase/queries/healthEvents';
import type { Pet } from '@/lib/supabase/queries/pets';
import type { WeightEntry } from '@/lib/supabase/queries/weightHistory';

function pt(key: string, opts?: Record<string, unknown>): string {
  return String(i18n.t(`profile:pdf.${key}`, opts ?? {}));
}

function agendaPt(key: string): string {
  return String(i18n.t(`agenda:types.${key}`));
}

async function loadImageDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function localDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

type ExportInput = {
  pet: Pet;
  photoUrl: string | null;
  weightHistory: WeightEntry[];
  healthEvents: HealthEvent[];
  checkins: Checkin[];
};

const MARGIN = 16;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LINE_H = 7;
const SECTION_GAP = 10;

export async function exportHealthSheet({ pet, photoUrl, weightHistory, healthEvents, checkins }: ExportInput): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = MARGIN;

  function checkPageBreak(needed: number) {
    if (y + needed > 277) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function sectionTitle(text: string) {
    checkPageBreak(LINE_H + 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(text, MARGIN, y);
    y += LINE_H - 1;
    doc.setDrawColor(229, 231, 235);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
  }

  function row(label: string, value: string) {
    checkPageBreak(LINE_H);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', MARGIN, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, MARGIN + 44, y);
    y += LINE_H;
  }

  function tableHeader(cols: Array<{ label: string; w: number }>) {
    checkPageBreak(LINE_H);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    let x = MARGIN;
    for (const col of cols) {
      doc.text(col.label, x, y);
      x += col.w;
    }
    y += LINE_H - 1;
    doc.setDrawColor(229, 231, 235);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
  }

  function tableRow(cols: Array<{ value: string; w: number }>) {
    checkPageBreak(LINE_H);
    let x = MARGIN;
    for (const col of cols) {
      const val = col.value.length > 30 ? col.value.slice(0, 28) + '…' : col.value;
      doc.text(val, x, y);
      x += col.w;
    }
    y += LINE_H;
  }

  // ── Title ──────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text(pt('title'), MARGIN, y);
  y += LINE_H + 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text(`${pt('generatedAt')}: ${new Date().toLocaleDateString(i18n.language)}`, MARGIN, y);
  y += SECTION_GAP;

  // ── Pet photo + info ───────────────────────────────────────────────────
  sectionTitle(pt('petInfo'));

  if (photoUrl) {
    const imgData = await loadImageDataUrl(photoUrl);
    if (imgData) {
      doc.addImage(imgData, 'JPEG', MARGIN, y, 36, 36);
      const infoX = MARGIN + 42;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(17, 24, 39);
      doc.text(pet.name ?? '', infoX, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      if (pet.species) doc.text(String(i18n.t(`profile:pet.species.${pet.species}`)), infoX, y + 16);
      if (pet.breed) doc.text(pet.breed, infoX, y + 23);
      y += 42;
    } else {
      row(pt('name'), pet.name ?? '');
      if (pet.species) row(pt('species'), String(i18n.t(`profile:pet.species.${pet.species}`)));
      if (pet.breed) row(pt('breed'), pet.breed);
    }
  } else {
    row(pt('name'), pet.name ?? '');
    if (pet.species) row(pt('species'), String(i18n.t(`profile:pet.species.${pet.species}`)));
    if (pet.breed) row(pt('breed'), pet.breed);
  }
  y += SECTION_GAP;

  // ── Weight history ─────────────────────────────────────────────────────
  sectionTitle(pt('weightHistory'));
  if (weightHistory.length === 0) {
    doc.text(pt('noWeight'), MARGIN, y);
    y += LINE_H;
  } else {
    tableHeader([
      { label: pt('date'), w: 50 },
      { label: pt('weightKg'), w: 40 },
    ]);
    for (const entry of weightHistory.slice(-20)) {
      tableRow([
        { value: entry.date, w: 50 },
        { value: `${entry.weight_kg} kg`, w: 40 },
      ]);
    }
  }
  y += SECTION_GAP;

  // ── Health events ──────────────────────────────────────────────────────
  sectionTitle(pt('healthEvents'));
  if (healthEvents.length === 0) {
    doc.text(pt('noEvents'), MARGIN, y);
    y += LINE_H;
  } else {
    tableHeader([
      { label: pt('type'), w: 40 },
      { label: pt('date'), w: 30 },
      { label: pt('nextDate'), w: 35 },
      { label: pt('description'), w: 73 },
    ]);
    for (const ev of healthEvents.slice(0, 30)) {
      tableRow([
        { value: agendaPt(ev.type), w: 40 },
        { value: ev.date, w: 30 },
        { value: ev.next_date ?? '-', w: 35 },
        { value: ev.description ?? '-', w: 73 },
      ]);
    }
  }
  y += SECTION_GAP;

  // ── Check-ins (last 30 days) ───────────────────────────────────────────
  sectionTitle(pt('checkins'));

  const today = new Date();
  const thirtyAgo = new Date(today);
  thirtyAgo.setDate(today.getDate() - 30);
  const fromStr = localDateStr(thirtyAgo);
  const last30 = checkins.filter((c) => c.date >= fromStr);

  if (last30.length === 0) {
    doc.text(pt('noCheckins'), MARGIN, y);
    y += LINE_H;
  } else {
    tableHeader([
      { label: pt('date'), w: 40 },
      { label: pt('score'), w: 30 },
    ]);
    for (const c of last30.slice(0, 31)) {
      tableRow([
        { value: c.date, w: 40 },
        { value: c.day_score !== null ? String(c.day_score) : '-', w: 30 },
      ]);
    }
  }
  y += SECTION_GAP;

  // ── Footer disclaimer ──────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const footerY = 285;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    const lines = doc.splitTextToSize(pt('disclaimer'), CONTENT_W - 20) as string[];
    doc.text(lines, MARGIN, footerY - lines.length * 4);
    doc.text(`${pt('page')} ${p}/${pageCount}`, PAGE_W - MARGIN, footerY, { align: 'right' });
  }

  const filename = `${pt('title')}-${(pet.name ?? 'pet').replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
