import { CoffeeClass, CoffeeImage } from "@/lib/types";
import { getDestinationX } from "@/lib/utils";
import { motion } from "motion/react";

interface IProps {
  item: CoffeeImage;
  classes: CoffeeClass[];
}

function ActiveItem({ item, classes }: IProps) {

  const { destX, duration } = getDestinationX(item.label, !!item.isError, classes);

  return (
    <motion.div
      initial={
        item.status === "scanning"
          ? {
            x: 0,      // sama dengan posisi scanner
            y: 0,
            scale: 0.8,
            opacity: 0,
          }
          : item.status === "traveling"
            ? {
              x: destX,  // muncul di jalur menuju bin
              y: 0,
              scale: 1,
              opacity: 1,
            }
            : {
              x: destX,  // untuk dropping juga mulai dari posisi bin
              y: 0,
              scale: 1,
              opacity: 1,
            }
      }
      animate={
        item.status === "scanning"
          ? {
            x: 0,      // tetap di 0 → tidak ada animasi geser horizontal
            y: 0,
            scale: 1,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" },
          }
          : item.status === "traveling"
            ? {
              x: destX,
              y: 0,
              opacity: 1,
              transition: {
                type: "tween",
                ease: "linear",
                duration, // sama dengan logika wait()
              },
            }
            : item.status === "dropping"
              ? {
                x: destX,
                y: 150, // jatuh ke bawah
                scale: 0.5,
                opacity: 1,
                transition: { duration: 0.8, ease: "backIn" },
              }
              : { opacity: 0 }
      }
      exit={{ opacity: 0 }}
      className="w-24 h-24"
    >
      <div className={`relative w-full h-full p-1 rounded-xl border-2 bg-slate-900 shadow-2xl ${item.label
        ? "border-emerald-500 shadow-emerald-500/20"
        : item.status === "error"
          ? "border-rose-500 shadow-rose-500/20"
          : "border-slate-600"
        }`}>
        <img src={item.previewUrl} className="w-full h-full object-cover rounded-lg" />

        {/* Label Tag */}
        {item.label && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          >
            {item.label}
          </motion.div>
        )}
        {item.status === "error" && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
          >
            ERROR
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default ActiveItem;