// import React from "react";

// const StatCard = ({
//   title,
//   value,
//   icon: Icon,
//   trend,
//   trendText,
//   iconColor = "text-gray-500",
// }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300">
      
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3">
//         <h4 className="text-sm font-semibold text-gray-500">
//           {title}
//         </h4>

//         {Icon && (
//           <Icon className={`w-6 h-6 ${iconColor}`} />
//         )}
//       </div>

//       {/* Value */}
//       <h2 className="text-2xl font-bold text-gray-800 mb-2">
//         {value}
//       </h2>

//       {/* Trend */}
//       {trend && (
//         <p
//           className={`text-sm font-medium ${
//             trend === "up"
//               ? "text-green-600"
//               : "text-red-600"
//           }`}
//         >
//           {trend === "up" ? "↑" : "↓"} {trendText}
//         </p>
//       )}
//     </div>
//   );
// };

// export default StatCard;
import React from "react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-emerald-400",
  glowColor = "emerald",
}) {
  const glowMap = {
    emerald: "hover:shadow-emerald-500/30 from-emerald-400/10",
    green: "hover:shadow-green-500/30 from-green-400/10",
    blue: "hover:shadow-blue-500/30 from-blue-400/10",
    yellow: "hover:shadow-yellow-400/30 from-yellow-400/10",
  };

  return (
    <div
      className={`
        relative overflow-hidden
        bg-white/10
        backdrop-blur-2xl
        border border-white/20
        rounded-2xl
        p-6
        shadow-xl shadow-black/40
        transition-all duration-300
        hover:bg-white/15
        hover:-translate-y-1
        ${glowMap[glowColor]}
      `}
    >
      {/* Glow Gradient */}
      <div
        className={`
          absolute inset-0
          bg-gradient-to-br
          ${glowMap[glowColor].split(" ")[1]}
          to-transparent
          opacity-0
          hover:opacity-100
          transition duration-300
        `}
      />

      <div className="relative flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>

        {Icon && (
          <Icon className={`w-6 h-6 ${iconColor}`} />
        )}
      </div>

      <p className={`relative text-2xl font-bold mt-4 ${iconColor}`}>
        {value}
      </p>
    </div>
  );
}
