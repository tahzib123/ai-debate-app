import { useEffect, useState } from "react";
import { useWebSocketClient } from "../../providers/WebsocketProvider";
import type { UsersTyping } from "../../types/DTO/usersTyping";
import { formatTypingIndicator } from "../../utils/formatTypingIndicator";

export function TypingIndicator() {
  const { lastMessage } = useWebSocketClient();
  const [typingMessage, setTypingMessage] = useState("");

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
        setTimeout(() => {
          setTypingMessage("");
        }, 5000);
      }
    } catch {
      console.error("Error parsing last message");
    }
  }, [lastMessage]);

  return typingMessage.length ? (
    <span className="text-gray-500">{typingMessage}</span>
  ) : null;
}
