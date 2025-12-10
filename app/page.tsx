"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ConveyorBeltPattern from "./_components/conveyor-belt-pattern";
import { CoffeeClass, CoffeeImage, SortStatus } from "@/lib/types";
import ActiveItem from "./_components/active-item";
import ScannerLaser from "./_components/scanner-laser";
import { getDestinationX } from "@/lib/utils";
import Image from "next/image";
import ClassBin from "./_components/class-bin";
import Footer from "./_components/footer";
import { LightRays } from "./_components/light-rays";
import Header from "./_components/header";

// --- CONSTANTS ---
const COFFEE_CLASSES: CoffeeClass[] = ["Green", "Light", "Medium", "Dark"]; // Ordered by "roast level" roughly to make sense visually

// --- MAIN PAGE ---

export default function CoffeeSortingPage() {
  const [images, setImages] = useState<CoffeeImage[]>([]);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- HANDLERS ---

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: CoffeeImage[] = Array.from(files).map((file) => ({
      id: `${file.name}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: "queued",
      isError: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setIsSystemActive(false);
  };

  const startSorting = () => {
    if (isSystemActive || images.every(i => i.status === "sorted" || i.status === "error")) return;
    setIsSystemActive(true);
    processQueue();
  };

  // The "Brain" of the machine - orchestrates the flow
  const processQueue = async () => {
    const queueItems = images.filter((img) => img.status === "queued");
    if (queueItems.length === 0) {
      setIsSystemActive(false);
      return;
    }

    // Process items with a stagger
    for (let i = 0; i < queueItems.length; i++) {
      const item = queueItems[i];

      // 1. Move to Scanner
      updateStatus(item.id, "scanning");

      // Wait for "scan" (simulated visual delay)
      await wait(1500);

      // 2. Classify (Simulate API)
      const isError = Math.random() < 0.15;
      let resultLabel: CoffeeClass | undefined;
      let resultConf: number | undefined;

      if (!isError) {
        resultLabel = COFFEE_CLASSES[Math.floor(Math.random() * COFFEE_CLASSES.length)];
        resultConf = 0.75 + Math.random() * 0.24;
      }

      updateImageResult(item.id, isError, resultLabel, resultConf);

      // ⬇️ ambil duration supaya sinkron dengan animasi traveling
      const { duration } = getDestinationX(resultLabel, isError, COFFEE_CLASSES);

      // 3. TRAVELING
      updateStatus(item.id, "traveling");

      // ❗ delay sesuai duration animasi
      await wait(duration * 1000 + 100); // +100ms buffer kecil biar pas di tengah

      // 4. DROPPING
      updateStatus(item.id, "dropping");
      await wait(800); // 0.8s sesuai transition dropping

      // 5. SELESAI
      updateStatus(item.id, isError ? "error" : "sorted");

      // jeda antar item
      await wait(400);
    }

    setIsSystemActive(false);
  };

  const updateStatus = (id: string, status: SortStatus) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, status } : img)));
  };

  const updateImageResult = (id: string, error: boolean, label?: CoffeeClass, confidence?: number) => {
    setImages((prev) => prev.map((img) => (img.id === id ? {
      ...img,
      // We don't change status here yet (it's still 'scanning'), just attach data
      label,
      confidence,
      isError: error,
    } : img)));
  };

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- DERIVED STATE ---
  const queuedImages = images.filter(i => i.status === "queued");
  const activeImage = images.find(i => i.status === "scanning" || i.status === "traveling" || i.status === "dropping");
  const sortedImages = images.filter(i => i.status === "sorted");
  const errorImages = images.filter(i => i.status === "error");

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <LightRays color="rgba(39, 176, 125, 0.5)" />
      <Header
        isSystemActive={isSystemActive}
        onClickReset={handleReset}
        disabled={isSystemActive || images.length === 0}
      />

      <main className="px-4 pt-24 pb-12 flex flex-col gap-8">

        {/* --- CONTROL PANEL & INPUT --- */}
        <section className="w-full grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6 max-w-7xl mx-auto">

          {/* Input Hopper & Queue List */}
          <div className="relative rounded-2xl border border-slate-800 bg-linear-to-b from-slate-950 via-slate-900/90 to-black p-6 flex flex-col gap-5 shadow-[0_18px_50px_rgba(15,23,42,0.9)]">
            {/* TOP STRIP */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="h-7 px-3 rounded-full bg-slate-950/90 border border-slate-700/70 flex items-center gap-2">
                    <span className="text-[11px] font-mono tracking-[0.18em] text-slate-300 uppercase">
                      Input Hopper
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isSystemActive
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                        : "bg-slate-500/70"
                        }`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    QUEUED:{" "}
                    <span className="text-slate-200">
                      {queuedImages.length.toString().padStart(2, "0")}
                    </span>
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Upload a coffee bean image to send to the scanner unit.
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSystemActive}
                className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-400/70 bg-emerald-600/90 text-white font-medium text-xs md:text-sm shadow-[0_0_18px_rgba(16,185,129,0.25)] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:border-slate-700 disabled:shadow-none"
              >
                {/* Isi tombol */}
                <span className="relative z-10 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-900/70 border border-emerald-400/40 text-[11px]">
                    +
                  </span>
                  <span>Add Images</span>
                </span>

                {/* highlight soft di atas tombol */}
                <span className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-b from-white/20 via-white/0 to-transparent opacity-40 mix-blend-screen" />

                {/* garis scan halus saat hover */}
                <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/18 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* border glow animasi pelan saat aktif */}
                {!isSystemActive && (
                  <span className="pointer-events-none absolute -inset-px rounded-xl border border-emerald-300/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </button>
            </div>

            {/* HIDDEN INPUT */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
              disabled={isSystemActive}
            />

            {/* HOPPER & QUEUE BELT */}
            <div className="relative w-full min-h-[140px] rounded-2xl border border-slate-800/80 bg-slate-950/80 overflow-hidden">
              {/* background track (kayak belt di dalam mesin) */}
              <div className="pointer-events-none absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%)]" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 bg-[repeating-linear-gradient(90deg,#020617_0,#020617_6px,#0f172a_6px,#0f172a_12px)]" />
              </div>

              {/* hopper head di kiri (mulut masuk) */}
              <div className="absolute left-0 top-0 bottom-0 w-28 bg-linear-to-r from-slate-950 via-slate-950/90 to-transparent border-r border-slate-800/80 z-10 flex flex-col items-center justify-center gap-2">
                <div className="w-16 h-7 rounded-t-2xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <span className="text-[10px] font-mono tracking-[0.16em] text-slate-300">
                    FEED
                  </span>
                </div>
                <div className="w-16 h-10 rounded-b-2xl bg-slate-950 border-x border-b border-slate-700/80 flex items-center justify-center">
                  <span className="text-[9px] text-slate-500 font-mono text-center">
                    Drop
                    <br />
                    Zone
                  </span>
                </div>
              </div>

              {/* scroll area untuk queue items */}
              <div className="relative pl-32 pr-4 py-3 h-full flex items-center">
                {queuedImages.length === 0 ? (
                  <div className="w-full text-center text-sm text-slate-600 italic">
                    No images in queue. Use <span className="font-semibold">Add Images</span>{" "}
                    to load the hopper.
                  </div>
                ) : (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1 w-full">
                    <AnimatePresence mode="popLayout">
                      {queuedImages.map((img, idx) => (
                        <motion.div
                          key={img.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8, y: 6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.6, y: 6 }}
                          className="relative min-w-20 h-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-[0_6px_14px_rgba(15,23,42,0.9)] shrink-0 group"
                        >
                          <img
                            src={img.previewUrl}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                          />
                          {/* overlay info */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-[9px] text-slate-100 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>QUEUE #{String(idx + 1).padStart(2, "0")}</span>
                            <span className="text-[8px] text-slate-300 truncate max-w-[80%]">
                              {img.file.name}
                            </span>
                          </div>
                          {/* badge kecil di sudut */}
                          <div className="absolute top-1 left-1 px-1.5 py-px rounded-full bg-black/60 text-[8px] font-mono text-amber-300">
                            Q
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Operation Stats / Info */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">Controls</h2>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Queue</span>
                  <span className="text-slate-200 font-mono">{queuedImages.length}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Processed</span>
                  <span className="text-slate-200 font-mono">{sortedImages.length + errorImages.length}</span>
                </div>
              </div>
            </div>

            <button
              onClick={startSorting}
              disabled={isSystemActive || queuedImages.length === 0}
              className="group relative mt-6 w-full py-4 rounded-2xl border border-emerald-400/70 bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(16,185,129,0.45)] transition disabled:opacity-40 disabled:shadow-none disabled:border-slate-700 disabled:cursor-not-allowed active:scale-[0.98] overflow-hidden"
            >
              {/* isi tombol */}
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isSystemActive ? (
                  <>
                    {/* “spinner” sederhana */}
                    <span className="relative flex h-5 w-5">
                      <span className="absolute inset-0 rounded-full border-2 border-emerald-200/40 border-t-transparent animate-spin" />
                    </span>
                    <span className="tracking-[0.2em] text-sm md:text-base">
                      PROCESSING...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/20 border border-emerald-300/60 text-sm">
                      ▶
                    </span>
                    <span className="tracking-[0.2em] text-sm md:text-base">
                      START SORTING
                    </span>
                  </>
                )}
              </span>

              {/* glow radial di tengah tombol */}
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.65),transparent_60%)] opacity-60 mix-blend-screen" />

              {/* efek scan horizontal saat hover (kalau tidak disabled & tidak processing) */}
              {!isSystemActive && queuedImages.length > 0 && (
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700" />
              )}
            </button>
          </div>
        </section>

        {/* --- THE MACHINE (Conveyor Belt) --- */}
        {/* Concept: A horizontal track. Left side = Scanner. Right side = Bins. */}

        <section className="relative w-full rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl max-w-7xl mx-auto">
          {/* Machine Header */}
          <div className="absolute top-4 left-6 z-10">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Sorting Line A-01</div>
          </div>

          {/* 1. The Belt Track */}
          <div className="absolute top-1/2 left-0 right-0 h-24 bg-slate-800/50 -translate-y-1/2 border-y border-slate-700/50">
            <ConveyorBeltPattern
              paused={!isSystemActive || ['dropping', 'scanning'].includes(activeImage?.status || '')}
            />
          </div>

          <div className="overflow-x-auto">
            <div className="relative pt-24 pb-16 px-8 select-none w-[calc(1280px-32px)]">

              {/* 2. Components along the track */}
              <div className="relative w-full h-full flex items-center gap-4">

                {/* A. SCANNER STATION (Left side) */}
                <div className="relative w-[300px] h-[300px] shrink-0">
                  {/* ACTIVE ITEM DI DALAM CHAMBER */}
                  <div className="absolute inset-0 flex items-center justify-center translate-y-[4%]">
                    <AnimatePresence>
                      {activeImage && (
                        <ActiveItem
                          key={activeImage.id}
                          item={activeImage}
                          classes={COFFEE_CLASSES}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* OUTER SHELL */}
                  <div className="absolute inset-0 rounded-[2.2rem] bg-linear-to-b from-slate-900 to-slate-950 border border-slate-700/80 shadow-[0_24px_60px_rgba(15,23,42,0.9)]" />

                  {/* TOP CAP + WARNING BAR */}
                  <div className="absolute inset-x-4 top-3 h-8 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                      <span className="w-2 h-2 rounded-full bg-yellow-400/80 shadow-[0_0_8px_rgba(250,204,21,0.9)]" />
                      <span className="w-2 h-2 rounded-full bg-rose-500/70 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                    </div>

                    <div className="flex-1 mx-2 h-3 rounded-full overflow-hidden bg-slate-800/80">
                      <div className="h-full w-full bg-[repeating-linear-gradient(135deg,#facc15_0,#facc15_6px,#0f172a_6px,#0f172a_12px)] opacity-80" />
                    </div>

                    <span className="text-[9px] font-mono tracking-[0.18em] text-slate-400">
                      SCN-01
                    </span>
                  </div>

                  {/* INNER GLASS CHAMBER */}
                  <div className="absolute inset-x-6 top-12 bottom-7 rounded-[1.8rem] bg-linear-to-b from-slate-900/80 via-slate-900/40 to-slate-950/95 border border-slate-700/70 overflow-hidden backdrop-blur-[2px]">
                    {/* Glass highlight */}
                    <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-emerald-400/15 via-emerald-300/0 to-transparent pointer-events-none" />

                    {/* Glow di dasar chamber */}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-emerald-400/10 blur-2xl pointer-events-none" />

                    {/* LASER */}
                    <ScannerLaser activeImage={activeImage} />

                    <div className="absolute inset-0 flex items-center justify-center blur-[2px]">
                      <AnimatePresence>
                        {activeImage && (
                          <ActiveItem
                            key={activeImage.id}
                            item={activeImage}
                            classes={COFFEE_CLASSES}
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* STATUS TEXT */}
                    {activeImage?.status === "scanning" ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-3 px-2.5 py-1 bg-black/40 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] rounded-full tracking-[0.18em]"
                      >
                        SCANNING...
                      </motion.div>
                    ) : (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-3 px-2.5 py-1 bg-black/30 text-slate-500 font-mono text-[10px] rounded-full tracking-[0.18em]">
                        IDLE
                      </div>
                    )}
                  </div>

                  {/* BOTTOM LABEL PLATE */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-[0_6px_20px_rgba(15,23,42,0.9)]">
                      <h4 className="text-[10px] font-mono tracking-[0.2em] text-slate-300">
                        SCANNER UNIT
                      </h4>
                    </div>
                    <p className="mt-1 text-[9px] text-slate-500 tracking-wide">
                      OPTICAL GRADE · v2.3
                    </p>
                  </div>
                </div>

                {/* B. SORTING CHUTES (Right side, distributed) */}
                {/* We need bins corresponding to the classes - FIXED WIDTH for precise animation mapping */}
                <div className="flex-1 inline-flex items-center justify-center gap-4">
                  {COFFEE_CLASSES.map((cls, idx) => (
                    <ClassBin
                      key={cls}
                      label={cls}
                      count={sortedImages.filter(i => i.label === cls).length}
                      colorIdx={idx}
                    />
                  ))}
                  {/* Error Bin */}
                  <ClassBin label="Error" count={errorImages.length} colorIdx={-1} isError />
                </div>
              </div>
            </div>
          </div>
          {/* Machine Footer / Legend */}
          <div className="h-12 bg-slate-950/50 border-t border-slate-800 flex items-center px-6 gap-6 text-xs text-slate-500 font-mono">
            <div>MODE: AUTO</div>
            <div>SPEED: 0.5x</div>
            <div>TEMP: 45°C</div>
          </div>
        </section>


        {/* --- INTERNAL STORAGE (Below machine) --- */}
        <section className="w-full max-w-7xl mx-auto">
          {/* Title strip yang masih nyambung ke tema mesin */}
          <div className="mb-3 flex items-center gap-2">
            <div className="h-7 px-3 rounded-full border border-slate-700/70 bg-slate-950/80 flex items-center gap-2">
              <span className="text-xs">📦</span>
              <span className="text-[11px] font-mono tracking-[0.18em] text-slate-300 uppercase">
                Internal Storage Bays
              </span>
            </div>
            <div className="h-px flex-1 bg-linear-to-r from-slate-500/60 via-slate-700/30 to-transparent" />
          </div>

          {/* RUMAH MESIN PENYIMPANAN */}
          <div className="w-full relative rounded-[1.8rem] border border-slate-800 bg-linear-to-b from-slate-950 via-slate-900/90 to-transparent px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.9)] overflow-hidden">
            {/* highlight atas housing */}
            <div className="pointer-events-none absolute inset-x-3 top-0 h-10 bg-linear-to-b from-white/8 via-emerald-400/5 to-transparent opacity-50" />
            {/* garis track horizontal di belakang (biar berasa dalam mesin) */}
            <div className="pointer-events-none absolute inset-x-0 top-9 bottom-4 opacity-[0.12]">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,#0f172a_0,#0f172a_2px,#020617_2px,#020617_6px)]" />
            </div>

            {/* Header kecil di kiri atas housing */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2 relative z-10">
              <span>STORAGE RACK · V2.3</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                ONLINE
              </span>
            </div>

            {/* GRID SLOT DI DALAM HOUSING */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 relative z-10">
              {[...COFFEE_CLASSES, "Error"].map((cls, idx) => {
                const isErr = cls === "Error";
                const items = isErr
                  ? errorImages
                  : sortedImages.filter((i) => i.label === cls);

                // warna aksen tipis di tepi slot
                const accentBorder = isErr
                  ? "border-rose-700/70"
                  : idx === 0
                    ? "border-emerald-500/60"
                    : idx === 1
                      ? "border-amber-400/60"
                      : idx === 2
                        ? "border-sky-400/60"
                        : "border-fuchsia-400/60";

                return (
                  <div
                    key={cls}
                    className={`relative flex flex-col rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner overflow-hidden group ${isErr ? 'md:col-span-2' : ''}`}
                  >
                    {/* garis aksen tipis di bagian atas slot */}
                    <div
                      className={`absolute inset-x-0 top-0 h-[3px] ${accentBorder} bg-linear-to-r from-transparent via-current to-transparent opacity-70`}
                    />

                    {/* HEAD STRIP: nama kelas + jumlah, rasa "label pada rak mesin" */}
                    <div className="px-2.5 pt-3 pb-2 flex items-center justify-between gap-1">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`text-[10px] font-mono tracking-[0.18em] uppercase ${isErr ? "text-rose-400" : "text-slate-300"
                            }`}
                        >
                          {isErr ? "ERROR BAY" : cls}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          SLOT #{String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-mono text-slate-300">
                          {items.length.toString().padStart(2, "0")}
                          <span className="opacity-60 text-[9px] ml-1">pcs</span>
                        </span>
                        <span
                          className={`mt-0.5 w-1.5 h-1.5 rounded-full ${isErr
                            ? "bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]"
                            : items.length
                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                              : "bg-slate-500/60"
                            }`}
                        />
                      </div>
                    </div>

                    {/* AREA DALAM SLOT: seperti "jendela" ke isi storage */}
                    <div className="flex-1 px-2.5 pb-2">
                      {items.length === 0 ? (
                        <div className="h-full min-h-[110px] rounded-xl border border-dashed border-slate-700/60 bg-slate-950/60 flex flex-col items-center justify-center gap-1 text-center">
                          <span className="text-[11px] text-slate-400">
                            Bay is empty.
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            Waiting input from conveyor…
                          </span>
                        </div>
                      ) : (
                        <div className="min-h-[110px] rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden relative">
                          {/* Isi bay dengan thumnail kecil, rapat, kaya tumpukan dalam mesin */}
                          <div className={`grid grid-cols-2 gap-[3px] p-1 ${isErr ? 'md:grid-cols-5' : 'md:grid-cols-3'}`}>
                            {items.map((img) => (
                              <div
                                key={img.id}
                                className="relative aspect-square rounded-md overflow-hidden border border-slate-700/70 bg-slate-900/80 group/item"
                              >
                                <img
                                  src={img.previewUrl}
                                  className="w-full h-full object-cover opacity-80 group-hover/item:opacity-100 transition"
                                />
                                {/* strip info tipis di bawah */}
                                {img.confidence && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-emerald-800/70 text-xs text-center text-slate-100 py-px">
                                    {Math.round(img.confidence * 100)}%
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* glow halus di belakang isi bay */}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-emerald-400/15 via-transparent to-transparent opacity-60" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto">
          <Footer />
        </section>
      </main>
    </div>
  );
}