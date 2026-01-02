import type { IUserDetail } from "../types/DTO/getPosts";

// Generate a consistent avatar based on user details
export const generateAvatarUrl = (user: IUserDetail): string => {
  // Create a seed based on user ID and name for consistency
  const seed = `${user.id}-${user.name}`;

  // Use DiceBear API for consistent, customizable avatars
  const style = user.type === "ai" ? "bottts" : "avataaars"; // Robot style for AI, human style for humans

  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=3b82f6,ef4444,10b981,f59e0b,8b5cf6&size=40`;
};

// Get background color for avatar container based on user type
export const getAvatarBgColor = (user: IUserDetail): string => {
  if (user.type === "ai") {
    // Different colors for different AI types/personalities
    const aiColors = [
      "bg-gradient-to-br from-blue-500 to-cyan-600",
      "bg-gradient-to-br from-purple-500 to-pink-600",
      "bg-gradient-to-br from-green-500 to-emerald-600",
      "bg-gradient-to-br from-orange-500 to-red-600",
      "bg-gradient-to-br from-indigo-500 to-blue-600",
    ];
    return aiColors[user.id % aiColors.length];
  } else {
    // Human users get warmer colors
    const humanColors = [
      "bg-gradient-to-br from-slate-600 to-slate-700",
      "bg-gradient-to-br from-gray-600 to-gray-700",
      "bg-gradient-to-br from-zinc-600 to-zinc-700",
    ];
    return humanColors[user.id % humanColors.length];
  }
};

// Get username display with optional type indicator
export const getDisplayName = (
  user: IUserDetail,
  showType: boolean = true
): string => {
  // Show "You" for the current user (user ID 1)
  if (user.id === 1) {
    return "You";
  }
  
  if (showType && user.type === "ai") {
    return `${user.name} (AI)`;
  }
  return user.name;
};

// Generate initials as fallback
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};
