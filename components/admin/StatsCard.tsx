// components/admin/StatsCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Card statistique pour le dashboard admin
// Affiche un KPI avec icône, valeur, label et évolution optionnelle
// ─────────────────────────────────────────────────────────────────────────────

type StatsCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "orange" | "blue" | "green" | "purple";
};

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  color = "orange",
}: StatsCardProps) {
  const colorClasses = {
    orange: "bg-orange-50 text-vla-orange",
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    purple: "bg-purple-50 text-purple-500",
  };

  return (
    <div
      className="bg-white rounded-2xl p-6 transition-all hover:shadow-lg"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
    >
      {/* Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>

        {/* Trend badge */}
        {trend && (
          <div
            className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
              trend.isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            <svg
              className={`w-3 h-3 ${trend.isPositive ? "" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <p className="font-black text-3xl text-vla-black">{value}</p>
      </div>

      {/* Label */}
      <p className="text-sm font-semibold text-gray-500">{label}</p>
    </div>
  );
}
