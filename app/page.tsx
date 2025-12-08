"use client";

import React, { useState, useRef } from "react";
import { motion } from "motion/react";

type DetectionStatus = "idle" | "processing" | "classified" | "error";

type CoffeeClass = "Dark" | "Green" | "Light" | "Medium";

interface CoffeeImage {
  id: string;
  file: File;
  previewUrl: string;
  status: DetectionStatus;
  label?: CoffeeClass;
  confidence?: number; // 0–1, hanya untuk hasil berhasil
}

const coffeeClasses: CoffeeClass[] = ["Dark", "Green", "Light", "Medium"];

const CoffeeDetectionPage: React.FC = () => {
  const [images, setImages] = useState<CoffeeImage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const next: CoffeeImage[] = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: url,
        status: "idle",
      };
    });

    setImages((prev) => [...prev, ...next]);
  };

  const handleStartDetection = () => {
    if (!images.length || isRunning) return;

    setIsRunning(true);

    // set semua jadi processing dulu
    setImages((prev) =>
      prev.map((img) =>
        img.status === "idle" || img.status === "classified" || img.status === "error"
          ? { ...img, status: "processing" as DetectionStatus, label: undefined, confidence: undefined }
          : img
      )
    );

    const baseDelay = 700; // ms

    images.forEach((img, index) => {
      const delay = baseDelay + index * 500;

      setTimeout(() => {
        const isError = Math.random() < 0.15; // 15% kemungkinan error

        setImages((prev) => {
          const updated: CoffeeImage[] = prev.map((item): CoffeeImage => {
            if (item.id !== img.id) return item;

            if (isError) {
              return {
                ...item,
                status: "error" as DetectionStatus,
                label: undefined,
                confidence: undefined,
              };
            } else {
              const randomClass =
                coffeeClasses[Math.floor(Math.random() * coffeeClasses.length)];
              // dummy confidence antara ~0.75 - 0.99
              const randomConfidence = 0.75 + Math.random() * 0.24;

              return {
                ...item,
                status: "classified" as DetectionStatus,
                label: randomClass,
                confidence: randomConfidence,
              };
            }
          });

          // cek apakah masih ada yang processing
          const stillProcessing = updated.some(
            (item) => item.status === "processing"
          );
          if (!stillProcessing) {
            setIsRunning(false);
          }

          return updated;
        });
      }, delay);
    });
  };

  const handleReset = () => {
    // revoke semua object URL sebelum reset
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setIsRunning(false);
  };

  const pendingImages = images.filter(
    (img) => img.status === "idle" || img.status === "processing"
  );
  const classifiedByClass = (label: CoffeeClass) =>
    images.filter((img) => img.status === "classified" && img.label === label);
  const errorImages = images.filter((img) => img.status === "error");

  const hasImages = images.length > 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-slate-950/60 backdrop-blur-lg p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              CoffeeRizer • Visi Komputer & Robotika (Projek Akhir)
            </div>
            <h1 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
              Deteksi Tingkat Kopi (Dark, Green, Light, Medium)
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl">
              Upload beberapa gambar biji atau bubuk kopi, lalu tekan{" "}
              <span className="font-semibold text-emerald-300">Mulai Deteksi</span>.
              Gambar akan bergerak menunjukkan proses deteksi dan berpindah ke kategori roast yang sesuai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReset}
              disabled={!hasImages || isRunning}
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs md:text-sm font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              onClick={handleStartDetection}
              disabled={!hasImages || isRunning}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-xs md:text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 active:scale-[0.98] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-900 animate-ping" />
                  Memproses...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Mulai Deteksi
                  <span className="text-lg">▶</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          {/* Left: Upload & Pending */}
          <div className="space-y-4">
            {/* Upload Area */}
            <motion.div
              className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-4 py-6 md:px-6 md:py-8 text-center cursor-pointer hover:border-emerald-500/60 hover:bg-slate-900 transition"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <div className="mb-3 flex items-center justify-center">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700"
                  animate={{ rotate: [0, -4, 4, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                  <span className="text-2xl">📷</span>
                </motion.div>
              </div>

              <div className="space-y-1">
                <p className="text-sm md:text-base font-medium text-slate-100">
                  Klik untuk upload gambar kopi
                </p>
                <p className="text-xs text-slate-400">
                  Bisa memilih lebih dari satu gambar sekaligus (JPG, PNG, dll.)
                </p>
              </div>

              {hasImages && (
                <div className="mt-3 text-xs text-emerald-300">
                  {images.length} gambar dipilih
                </div>
              )}
            </motion.div>

            {/* Pending / Processing */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Antrian Deteksi
                  </span>
                  {isRunning && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Sedang memproses...
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">
                  {pendingImages.length} item
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 min-h-20">
                {pendingImages.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    layoutId={img.id}
                    className="relative"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                  >
                    <motion.div
                      className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm"
                      animate={
                        img.status === "processing"
                          ? {
                            y: [0, -6, 0],
                            boxShadow: "0px 18px 40px rgba(16,185,129,0.26)",
                          }
                          : { y: 0, boxShadow: "0px 10px 30px rgba(15,23,42,0.7)" }
                      }
                      transition={
                        img.status === "processing"
                          ? {
                            duration: 0.7,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                          : { duration: 0.2 }
                      }
                    >
                      <div className="aspect-4/3 w-full overflow-hidden bg-slate-800">
                        <motion.img
                          src={img.previewUrl}
                          alt={img.file.name}
                          className="h-full w-full object-cover"
                          whileHover={{ scale: 1.06 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex items-center justify-between px-2.5 py-1.5">
                        <p className="truncate text-[10px] text-slate-300">
                          {img.file.name}
                        </p>
                        <span
                          className={`ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${img.status === "processing"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                        >
                          {img.status === "processing" ? "Memproses..." : "Menunggu"}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}

                {!pendingImages.length && (
                  <div className="col-span-full flex h-20 items-center justify-center text-xs text-slate-500">
                    Belum ada gambar di antrian.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Result Lanes */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coffeeClasses.map((label) => {
                const data = classifiedByClass(label);
                return (
                  <motion.div
                    key={label}
                    layout
                    className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {label} Roast
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {data.length} gambar
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-200/80">
                        Lane kopi
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 flex-1 min-h-[72px]">
                      {data.map((img) => (
                        <motion.div
                          key={img.id}
                          layout
                          layoutId={img.id}
                          initial={{ opacity: 0, scale: 0.6, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.7, y: -10 }}
                          transition={{ type: "spring", stiffness: 260, damping: 22 }}
                          className="overflow-hidden rounded-lg border border-emerald-500/40 bg-slate-900 shadow-md"
                        >
                          <div className="aspect-4/3 w-full overflow-hidden bg-slate-800">
                            <motion.img
                              src={img.previewUrl}
                              alt={img.file.name}
                              className="h-full w-full object-cover"
                              whileHover={{ scale: 1.08, rotate: 0.5 }}
                              transition={{ duration: 0.35 }}
                            />
                          </div>
                          <div className="flex items-center justify-between px-2.5 py-1.5 text-[10px]">
                            <span className="truncate text-slate-200">
                              {img.file.name}
                            </span>
                            {typeof img.confidence === "number" && (
                              <span className="ml-1 rounded-full bg-emerald-500/15 border border-emerald-400/50 px-1.5 py-0.5 font-semibold text-emerald-300">
                                {(img.confidence * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {!data.length && (
                        <div className="col-span-full flex min-h-[72px] items-center justify-center text-[10px] text-slate-600 border border-dashed border-slate-700 rounded-lg">
                          Menunggu hasil deteksi...
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Error Lane */}
            <motion.div
              layout
              className="rounded-2xl border border-rose-900 bg-linear-to-r from-rose-950/80 via-slate-950/70 to-slate-900/70 p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-900 text-[11px]">
                    !
                  </span>
                  <span className="text-xs font-semibold text-rose-100">
                    Klasifikasi Error
                  </span>
                </div>
                <span className="text-[10px] text-rose-200/80">
                  {errorImages.length} gambar
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 min-h-[72px]">
                {errorImages.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    layoutId={img.id}
                    initial={{ opacity: 0, scale: 0.7, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.7, x: -20 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="overflow-hidden rounded-lg border border-rose-700 bg-rose-950/80 shadow-md"
                  >
                    <div className="aspect-4/3 w-full overflow-hidden bg-rose-950">
                      <motion.img
                        src={img.previewUrl}
                        alt={img.file.name}
                        className="h-full w-full object-cover"
                        whileHover={{ scale: 1.06, rotate: -0.5 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                ))}

                {!errorImages.length && (
                  <div className="col-span-full flex h-[72px] items-center justify-center text-[10px] text-rose-200/70 border border-dashed border-rose-800/70 rounded-lg bg-rose-950/40">
                    Tidak ada error deteksi saat ini.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Explanation Section */}
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 space-y-3">
          <h2 className="text-sm md:text-base font-semibold text-slate-100">
            Penjelasan Kategori Roast
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Model CNN kamu akan mengklasifikasikan citra kopi ke dalam empat kategori tingkat
            roast berikut. Penjelasan singkat ini bisa kamu pakai juga nanti di laporan atau poster.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs md:text-sm">
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-50">Green</span>
                <span className="text-[10px] text-emerald-300">Belum disangrai</span>
              </div>
              <p className="text-slate-400 text-xs">
                Biji kopi mentah berwarna hijau, kadar air masih tinggi, belum mengalami proses
                roasting. Tekstur cenderung keras dan aroma rumput/herbal.
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-50">Light</span>
                <span className="text-[10px] text-amber-300">Roast ringan</span>
              </div>
              <p className="text-slate-400 text-xs">
                Warna cokelat muda, lebih menonjolkan karakter asli origin (acidity tinggi,
                rasa fruity/flower). Minyak belum banyak muncul di permukaan biji.
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-50">Medium</span>
                <span className="text-[10px] text-orange-300">Seimbang</span>
              </div>
              <p className="text-slate-400 text-xs">
                Warna cokelat sedang, keseimbangan antara acidity, sweetness, dan body.
                Banyak dipakai untuk seduhan harian karena rasanya yang relatif aman/netral.
              </p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-50">Dark</span>
                <span className="text-[10px] text-rose-300">Roast gelap</span>
              </div>
              <p className="text-slate-400 text-xs">
                Warna cokelat tua hingga hampir hitam, permukaan biji berminyak.
                Rasa cenderung pahit, smoky, dan origin flavor mulai tertutup oleh karakter roasting.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="pt-2 border-t border-slate-800/70 text-[10px] md:text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <p>CoffieRizer {new Date().getFullYear()}</p>
          <p>Created by Aam, Gia, Kinan, Nadhilah, & Syamsul</p>
        </div>
      </div>
    </div>
  );
};

export default CoffeeDetectionPage;
