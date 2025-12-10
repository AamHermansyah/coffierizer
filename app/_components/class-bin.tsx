interface IProps {
  label: string;
  count: number;
  colorIdx: number;
  isError?: boolean;
}

function ClassBin({ label, count, colorIdx, isError }: IProps) {
  const hasItems = count > 0;

  const gateGlow =
    isError && hasItems
      ? "bg-rose-400/50 shadow-[0_0_12px_rgba(248,113,113,0.8)]"
      : hasItems
        ? "bg-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.7)]"
        : "bg-slate-500/40";

  const fillColor = isError ? "bg-rose-500" : "bg-emerald-500";

  return (
    <div className="relative flex flex-col items-center justify-end h-full w-[100px] group">
      {/* Label & count */}
      <div className="mb-3 text-center z-20">
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border transform transition group-hover:-translate-y-1 ${isError
            ? "bg-rose-950 text-rose-400 border-rose-900"
            : "bg-slate-900 text-slate-300 border-slate-700 group-hover:border-emerald-500/50"
            }`}
        >
          {label}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">
          {count} ITEMS
        </div>
      </div>

      {/* BIN + GATE (kayak conveyor bandara) */}
      <div className="translate-y-24 w-24 h-32 relative">
        {/* Bin container */}
        <div
          className={`absolute inset-0 rounded-b-xl border-x-2 border-b-2 backdrop-blur-sm transition-colors overflow-hidden ${isError
            ? "border-rose-900/50 bg-rose-900/5"
            : "border-slate-700/50 bg-slate-800/20 group-hover:bg-slate-800/30"
            }`}
        >
          {/* Fill meter */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-500 opacity-25 ${fillColor}`}
            style={{ height: `${Math.min(count * 5, 100)}%` }}
          />
        </div>

        {/* GATE HOOD (penutup atas, bentuk seperti gerbang check-in) */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-20 h-7">
          {/* hood luar */}
          <div className="absolute inset-0 rounded-t-2xl bg-slate-900 border border-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.9)]">
            {/* highlight atas */}
            <div className="absolute inset-x-1 top-0 h-2 rounded-t-2xl bg-linear-to-b from-slate-300/15 via-slate-100/5 to-transparent" />
            {/* garis panel depan */}
            <div className="absolute inset-x-2 bottom-1 h-0.5 bg-slate-500/40 rounded-full" />
          </div>

          {/* LINE INDIKATOR di depan hood */}
          <div
            className={`absolute inset-x-4 bottom-0 h-[3px] rounded-full ${gateGlow}`}
          />
        </div>

        {/* MULUT CONVEYOR (slot masuk seperti conveyor bagasi) */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-18 h-6 rounded-b-xl border-x border-b border-slate-700 bg-slate-950 overflow-hidden">
          {/* belt strip di mulut gate */}
          <div className="absolute inset-x-1 bottom-1 h-3 rounded-md bg-[repeating-linear-gradient(90deg,#64748b_0,#64748b_5px,#020617_5px,#020617_10px)] opacity-80" />
          {/* glow di dalam lubang */}
          <div
            className={`absolute inset-x-2 top-0 h-0.5 ${gateGlow} blur-[2px]`}
          />
        </div>
      </div>
    </div>
  );
}

export default ClassBin;
