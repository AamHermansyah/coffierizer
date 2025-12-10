import { CoffeeClass } from "./types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to estimate X position for the bins
// We assume the Bins container starts at roughly 360px offset (Scanner width + gap).
// The bins are distributed. This is a bit "magic number"-y but fits the requested "visual" task.
// Helper to estimate X position for the bins
// We assume the Bins container starts at roughly 360px offset (Scanner width + gap).
// The bins are distributed. This is a bit "magic number"-y but fits the requested "visual" task.
export function getDestinationX(
  label: CoffeeClass | undefined,
  isError: boolean,
  classes: CoffeeClass[]
): { destX: number; duration: number } {
  // FIX: Precisely matched to the width of elements
  // Scanner = 300px
  // Gap = 12 * 4 = 48px => 348px Start of bins.
  // Bin Width = 100px. Gap = 16px (gap-4).
  // Total Bin Pitch = 116px.

  // Center of Bin 0 = Start + 50.
  // Start X = 300 (scanner) + 48 (gap) = 348.

  const START_X = 348;
  const BIN_PITCH = 100 + 16;

  // The item is 96px wide (w-24). Center is 48px.
  // We want Center-to-Center alignment.
  // Item Center relative to left: X + 48.
  // Bin Center relative to left: START_X + (idx * BIN_PITCH) + 50.
  // Equilibrium: X + 48 = START_X + (idx*BIN_PITCH) + 50
  // X = START_X + (idx*BIN_PITCH) + 2

  const OFFSET_ERROR = 20; // Slight visual tweak for visual centering if needed

  // === 1) LOGIKA X ASLI (TIDAK DIUBAH) ===
  let destX: number;
  let idxForDuration: number; // index yang dipakai untuk mengatur durasi

  if (isError) {
    // Error is the last one (index 4)
    destX = START_X + 4 * BIN_PITCH + OFFSET_ERROR;
    idxForDuration = classes.length; // biasanya 4 → paling kanan = paling lambat
  } else if (!label) {
    destX = START_X;
    idxForDuration = 0;
  } else {
    const idx = classes.indexOf(label);
    if (idx === -1) {
      destX = START_X;
      idxForDuration = 0;
    } else {
      destX = START_X + idx * BIN_PITCH + OFFSET_ERROR;
      idxForDuration = idx;
    }
  }

  // === 2) HITUNG DURASI BERDASARKAN JARAK + INDEX BIN ===
  // Asumsi posisi awal di ActiveItem saat scanning = x: 0
  const SCANNER_X = 0;
  const distance = Math.abs(destX - SCANNER_X); // jarak (px) dari scanner ke bin

  const PIXELS_PER_SECOND = 220; // base speed
  const baseDuration = distance / PIXELS_PER_SECOND; // durasi dasar

  // Kita ingin:
  // - index 0 & 1 (bin paling kiri + kiri kedua): durasi ≈ baseDuration (yang kedua sudah "pas")
  // - index >= 2: makin kanan → makin lambat
  let multiplier = 1;

  if (idxForDuration > 1) {
    // mulai dari bin ke-3 baru kita perlambat
    // misal: idx=2 → *1.25, idx=3 → *1.5, idx=4(error) → *1.75
    multiplier = 1 + (idxForDuration - 1) * 0.25;
  }

  let duration = baseDuration * multiplier;

  const MIN_DURATION = 0.6;
  const MAX_DURATION = 4.5; // biar paling kanan kerasa jauh lebih lama

  duration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, duration));

  return { destX, duration };
}
