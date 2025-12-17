import { Post } from "../Post";
import type { IPost } from "../../types/DTO/getPosts";
import { useWebSocketClient } from "../../providers/WebsocketProvider";
import { useEffect } from "react";
import { useGlobalStore } from "../../store/globalStore";
import type { TPostReply } from "../../types/DTO/postReply";

interface PostsProps {
  posts: Array<IPost>;
}
export function Posts({ posts }: PostsProps) {
  const { lastMessage } = useWebSocketClient();
  const { postReplies, setPostReplies } = useGlobalStore();

  useEffect(() => {
    try {
      if (!lastMessage || !lastMessage.data) return;
      const message = JSON.parse(lastMessage?.data);
      if (message && message.type == "post_reply") {
        const post_reply_message: TPostReply = message;
        setPostReplies({
          ...postReplies,
          [post_reply_message.post_id]: [
            ...(postReplies[post_reply_message.post_id] || []),
            post_reply_message.message,
          ],
        });
      }
    } catch {
      console.error("Error parsing last message");
    }
  }, [lastMessage]);
  return (
    <div className="w-full  ">
      {posts.map((p, index) => (
        <Post key={index} post={p} />
      ))}
    </div>
  );
}
