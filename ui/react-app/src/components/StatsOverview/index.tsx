import { useStatistics } from "../../api/requests/getPosts";

export function StatsOverview() {
  const { data: stats, isLoading, error } = useStatistics();

  if (isLoading) {
    return (
      <div className="flex gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span>Unable to load stats</span>
      </div>
    );
  }

  const statItems = [
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
            clipRule="evenodd"
          />
        </svg>
      ),
      label: `${stats.total_posts} Active Debates`,
      color: "text-blue-400",
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      label: `${stats.total_users} Participants`,
      color: "text-green-400",
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      label: `${stats.active_debates} Active Topics`,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-400">
      {statItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className={item.color}>{item.icon}</div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
