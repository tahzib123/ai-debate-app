export function formatTypingIndicator(usernames: string[]): string {
  if (usernames.length === 0) {
    return "";
  }

  if (usernames.length === 1) {
    return `${usernames[0]} is typing...`;
  }

  if (usernames.length === 2) {
    return `${usernames[0]} and ${usernames[1]} are typing...`;
  }

  // More than 2 users
  const lastUser = usernames[usernames.length - 1];
  const others = usernames.slice(0, -1).join(", ");
  return `${others}, and ${lastUser} are typing...`;
}
