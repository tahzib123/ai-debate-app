import { useEffect, useState } from "react";
import { useWebSocketClient } from "../../providers/WebsocketProvider";
import type { UsersTyping } from "../../types/DTO/usersTyping";
import { formatTypingIndicator } from "../../utils/formatTypingIndicator";

export function TypingIndicator() {
  const { lastMessage } = useWebSocketClient();
  const [typingMessage, setTypingMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      if (!lastMessage || !lastMessage.data) return;
      const message = JSON.parse(lastMessage?.data);
      if (message && message.type == "post_users_typing") {
        const post_users_typing_message: UsersTyping = message;
        const formatted_typing_message = formatTypingIndicator(
          post_users_typing_message.message
        );
        setTypingMessage(formatted_typing_message);
        setIsVisible(true);
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => setTypingMessage(""), 300); // Allow fade out animation
        }, 5000);
      }
    } catch {
      console.error("Error parsing last message");
    }
  }, [lastMessage]);

  if (!typingMessage) return null;

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="flex items-center gap-3 text-gray-400 text-sm">
        <div className="flex items-center gap-1">
          {/* Animated typing dots */}
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
        <span className="animate-fade-in">{typingMessage}</span>
      </div>
    </div>
  );
}
