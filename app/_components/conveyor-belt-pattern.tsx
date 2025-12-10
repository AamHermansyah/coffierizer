import { motion, useAnimationControls } from "motion/react";
import { useEffect } from "react";

type ConveyorBeltPatternProps = {
  paused?: boolean;
  duration?: number; // detik per satu siklus gerakan
};

const ConveyorBeltPattern: React.FC<ConveyorBeltPatternProps> = ({
  paused = false,
  duration = 8,
}) => {
  const controls = useAnimationControls();

  useEffect(() => {
    if (paused) {
      // JEDA: stop animasi di posisi sekarang
      controls.stop();
    } else {
      // CONTINUE: mulai / lanjut animasi
      controls.start({
        x: ["-50%", "0%"], // arah ke kanan
        transition: {
          repeat: Infinity,
          duration,
          ease: "linear",
        },
      });
    }
  }, [paused, duration, controls]);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
      <motion.div
        className="flex h-full w-[200%] bg-[repeating-linear-gradient(90deg,transparent,transparent_48px,#ffffff_50px,transparent_52px)]"
        animate={controls}
      />
    </div>
  );
};

export default ConveyorBeltPattern;
