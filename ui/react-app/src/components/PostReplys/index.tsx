import { Fragment, useEffect, useMemo, useState } from "react";
import { useWebSocketClient } from "../../providers/WebsocketProvider";
import type { IPost } from "../../types/DTO/getPosts";
import type { TPostReply } from "../../types/DTO/postReply";
import { useGlobalStore } from "../../store/globalStore";
import getCommentsForPost from "../../api/requests/getCommentsForPost";
import { TypingIndicator } from "../TypingIndicator";

interface PostRepliesProps {
  post: IPost;
}
export function PostReplies({ post }: PostRepliesProps) {
  const [reply, setReply] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const { sendMessage } = useWebSocketClient();
  const { postReplies, setPostReplies } = useGlobalStore();
  const { data: commentData } = getCommentsForPost(post.id.toString(), {
    enabled: showReplies,
  });

  const repliesForPost = useMemo(() => {
    return postReplies[post.id] ?? [];
  }, [postReplies, post.id]);

  useEffect(() => {
    if (!commentData || commentData.length === 0) return;
    const commentText = commentData.map((c) => c.content);
    setPostReplies({ ...postReplies, [post.id]: commentText });
  }, [commentData, post.id]);

  const sendComment = () => {
    if (reply && reply.length > 0) {
      const msg: TPostReply = {
        type: "post_reply",
        message: reply,
        post_id: post.id,
        user_id: 1,
      };
      sendMessage(JSON.stringify(msg));
      setReply("");
    }
  };

  const handleReplyChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReply(e.currentTarget.value);
  };

  return (
    <Fragment>
      <button
        onClick={() => setShowReplies(!showReplies)}
        className=" mt-4 flex items-center gap-2 text-gray-400 cursor-pointer"
      >
        {showReplies ? "Hide Discussion" : "Show Discussion"}
        {showReplies && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 15.75 7.5-7.5 7.5 7.5"
            />
          </svg>
        )}
        {!showReplies && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        )}
      </button>
      {showReplies && (
        <div className="mt-4">
          <div className="mb-4 space-y-4 max-h-[500px] overflow-auto">
            {repliesForPost.map((reply, index) => {
              return <Reply key={index} message={reply} />;
            })}
          </div>
          <div className="my-2 h-8">
            <TypingIndicator />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="reply"
              className="
              p-2 px-4 flex-1 rounded-2xl
              bg-slate-800/50
              backdrop-blur-md
              border border-gray-700/30
              caret-cyan-400
              placeholder-gray-400
              text-white
              focus:outline-none 
              transition duration-300 ease-in-out
              "
              onChange={handleReplyChanged}
              value={reply}
            />
            <button
              className="btn rounded-2xl px-8 text-green-300 disabled:text-gray-500"
              onClick={sendComment}
              disabled={reply.length <= 0}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </Fragment>
  );
}

interface ReplyProps {
  message: string;
}
export const Reply = ({ message }: ReplyProps) => {
  return (
    <Fragment>
      <div className="chat chat-start">
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img
              alt="Tailwind CSS chat bubble component"
              src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
            />
          </div>
        </div>
        <div className="chat-header ">
          Obi-Wan Kenobi
          <time className="text-xs opacity-50">2 hours ago</time>
        </div>
        <div className="text-gray-300 max-w-[100ch]">{message}</div>
      </div>
    </Fragment>
  );
};
