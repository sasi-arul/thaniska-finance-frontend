export default function Preloader({ onFinish }) {
  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center overflow-hidden
      bg-gradient-to-br from-slate-950 via-emerald-950 to-black">

      {/* Floating background glows */}
      <div className="absolute w-[700px] h-[700px] bg-emerald-500/20 rounded-full blur-3xl animate-pulse -top-32 -left-32"></div>
      <div className="absolute w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-3xl bottom-0 right-0 animate-[spin_30s_linear_infinite]"></div>

      {/* Glass panel */}
      <div className="relative z-10 flex flex-col items-center justify-center
        px-10 py-12 rounded-2xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-2xl shadow-emerald-500/20">

        {/* Title */}
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-widest text-center
          bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-500
          bg-clip-text text-transparent
          drop-shadow-[0_0_25px_rgba(16,185,129,0.6)]
          animate-shimmer"
        >
          THANISKA FINANCE
        </h1>

        {/* Subtitle (optional but classy) */}
        <p className="mt-4 text-slate-300 tracking-wide">
          Smart • Secure •  Financial Service
        </p>

        {/* Button */}
        <button
          onClick={onFinish}
          className="mt-8 px-10 py-3 rounded-full
          bg-gradient-to-r from-emerald-500 to-teal-400
          text-black font-semibold text-lg
          shadow-lg shadow-emerald-500/40
          hover:scale-105 hover:shadow-emerald-400/60
          transition-all duration-300"
        >
          Enter Dashboard
        </button>
      </div>
    </div>
  );
}
