import { CoffeeImage } from "@/lib/types";
import { motion } from "motion/react";

type LaserProps = {
  activeImage?: CoffeeImage | null;
};

const ScannerLaser: React.FC<LaserProps> = ({ activeImage }) => {
  const isScanning = activeImage?.status === "scanning";
  const isError = activeImage?.isError || activeImage?.status === "error";

  const colorClass = isScanning
    ? "bg-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.8)]"
    : isError
      ? "bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
      : "bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.8)]";

  const baseClass =
    "absolute left-0 right-0 w-full h-1 z-20 pointer-events-none";

  // Kalau sedang SCANNING → animasi "scan" (naik-turun)
  if (isScanning) {
    return (
      <motion.div
        className={`${baseClass} ${colorClass}`}
        initial={{ top: "5%", opacity: 0.2 }}
        animate={{
          top: ["5%", "90%"],     // sapu dari atas ke bawah
          opacity: [0.2, 1, 0.2],  // sedikit berkedip saat jalan
        }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 0.8,          // kecepatan scan, silakan diatur
          ease: "linear",
        }}
      />
    );
  }

  // Selain scanning (idle / traveling / dropping / error) → garis statis di tengah
  return (
    <div
      className={`${baseClass} ${colorClass} animate-pulse`}
      style={{ top: "10%" }} // kira-kira posisi tengah scanner
    />
  );
};

export default ScannerLaser;
