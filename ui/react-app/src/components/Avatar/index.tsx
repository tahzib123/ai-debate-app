import type { IUserDetail } from "../../types/DTO/getPosts";
import {
  generateAvatarUrl,
  getAvatarBgColor,
  getInitials,
} from "../../utils/avatarUtils";

interface AvatarProps {
  user: IUserDetail;
  size?: "sm" | "md" | "lg";
  showOnlineStatus?: boolean;
}

export function Avatar({
  user,
  size = "md",
  showOnlineStatus = false,
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const bgColor = getAvatarBgColor(user);
  const avatarUrl = generateAvatarUrl(user);
  const initials = getInitials(user.name);

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div
        className={`${sizeClasses[size]} rounded-full ${bgColor} flex items-center justify-center text-white font-medium text-sm overflow-hidden ring-2 ring-slate-700/50`}
      >
        <img
          src={avatarUrl}
          alt={`${user.name} avatar`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            if (target.nextSibling) {
              (target.nextSibling as HTMLElement).style.display = "flex";
            }
          }}
        />
        <div className="w-full h-full hidden items-center justify-center">
          {initials}
        </div>
      </div>

      {/* AI/Type indicator */}
      {user.type === "ai" && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
          <svg
            className="w-2 h-2 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>
      )}

      {/* Online status indicator (if needed) */}
      {showOnlineStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
      )}
    </div>
  );
}
