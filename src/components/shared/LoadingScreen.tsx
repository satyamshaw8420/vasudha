import { motion } from 'framer-motion';


export function LoadingScreen() {
  return (
    <div className="fixed inset-0 min-h-screen z-50 flex items-center justify-center bg-[var(--bg-primary)] overflow-hidden">
      {/* Bioluminescent Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--brand-primary)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#4A9D82] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-[var(--brand-primary)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center p-8 rounded-2xl glass-panel glass-border max-w-sm w-full mx-4">
        <motion.div
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-[var(--brand-primary)] blur-3xl opacity-30 rounded-full"></div>
          <div className="relative w-24 h-24 rounded-full glass-panel glass-border flex items-center justify-center overflow-hidden p-2">
            <img src="/logo2.png" alt="Vasudha Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
          </div>
        </motion.div>

        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-primary)] to-[#4A9D82] mb-2 font-outfit">
          Vasudha
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6 text-center">
          Restoring the Earth's balance...
        </p>

        <div className="w-full h-1 bg-[var(--border-color)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-[#4A9D82]"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "50%", "100%"] }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>
      </div>
    </div>
  );
}
