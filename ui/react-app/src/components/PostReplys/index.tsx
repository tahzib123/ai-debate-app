import { Fragment, useEffect, useMemo, useState } from "react";
import { useWebSocketClient } from "../../providers/WebsocketProvider";
import type { IPost } from "../../types/DTO/getPosts";
import type { TPostReply } from "../../types/DTO/postReply";
import { useGlobalStore } from "../../store/globalStore";
import getCommentsForPost from "../../api/requests/getCommentsForPost";
import { TypingIndicator } from "../TypingIndicator";
import { Avatar } from "../Avatar";
import { getDisplayName } from "../../utils/avatarUtils";
import { useRef } from "react";

interface PostRepliesProps {
  post: IPost;
}

export function PostReplies({ post }: PostRepliesProps) {
  const [reply, setReply] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { sendMessage } = useWebSocketClient();
  const { postReplies, setPostReplies, aiThinkingPosts, setAiThinking } =
    useGlobalStore();

  // Enable comment fetching if replies are shown OR if this is a new post with AI thinking
  const shouldFetchComments = showReplies || aiThinkingPosts.has(post.id);
  const { data: commentData } = getCommentsForPost(post.id.toString(), {
    enabled: shouldFetchComments,
    refetchInterval: aiThinkingPosts.has(post.id) ? 500 : false, // Poll every 500ms when AI is thinking for faster updates
  });

  const repliesForPost = useMemo(() => {
    return postReplies[post.id] ?? [];
  }, [postReplies, post.id]);

  const repliesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!commentData || commentData.length === 0) return;
    setPostReplies({ ...postReplies, [post.id]: commentData });
  }, [commentData, post.id]);

  useEffect(() => {
    if (showReplies && repliesEndRef.current) {
      repliesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [repliesForPost, showReplies]);

  // Check if this is a newly created post and trigger AI thinking
  useEffect(() => {
    const postAge = Date.now() - new Date(post.created_at).getTime();
    const isNewPost = postAge < 30000; // Less than 30 seconds old

    if (
      isNewPost &&
      repliesForPost.length === 0 &&
      !aiThinkingPosts.has(post.id)
    ) {
      setAiThinking(post.id, true);
      // Let the backend handle removing the AI thinking state when responses arrive
    }
  }, [
    post.id,
    post.created_at,
    repliesForPost.length,
    aiThinkingPosts,
    setAiThinking,
  ]);

  // Handle AI thinking removal and auto-expansion when comments arrive
  useEffect(() => {
    if (repliesForPost.length > 0 && aiThinkingPosts.has(post.id)) {
      // Remove AI thinking indicator
      setAiThinking(post.id, false);

      // Auto-expand discussion if not already expanded
      if (!showReplies) {
        setShowReplies(true);
        setIsExpanded(true);
      }
    }
  }, [
    repliesForPost.length,
    post.id,
    aiThinkingPosts,
    setAiThinking,
    showReplies,
  ]);

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

      // Show AI thinking indicator
      setAiThinking(post.id, true);
      // Let the AI responses naturally remove this state
    }
  };

  const handleReplyChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReply(e.currentTarget.value);
    // Auto-resize textarea
    e.currentTarget.style.height = "auto";
    e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && reply.trim().length > 0) {
      e.preventDefault();
      sendComment();
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
    setIsExpanded(!isExpanded);
  };

  return (
    <Fragment>
      <div className="mt-6 pt-4 border-t border-slate-700/30">
        {/* Discussion toggle button */}
        <button
          onClick={toggleReplies}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-4"
        >
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-medium">
              {showReplies
                ? "Hide Discussion"
                : `Join Discussion (${post.comment_count})`}
            </span>
          </div>
          <div className="ml-auto text-xs opacity-60 group-hover:opacity-100 transition-opacity">
            {post.comment_count > 0 &&
              !showReplies &&
              `${post.comment_count} ${
                post.comment_count === 1 ? "reply" : "replies"
              }`}
          </div>
        </button>

        {/* Replies section */}
        {showReplies && (
          <div className="animate-fade-in">
            {/* Comment input */}
            <div className="mb-6 p-4 glass rounded-xl border border-slate-700/30">
              <div className="flex gap-3">
                <Avatar user={post.created_by_detail} size="sm" />
                <div className="flex-1">
                  <textarea
                    rows={1}
                    placeholder="Share your thoughts on this debate..."
                    className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-xl resize-none text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    onChange={handleReplyChanged}
                    value={reply}
                    onKeyDown={handleInputKeyDown}
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <kbd className="px-2 py-1 bg-slate-700/50 rounded text-xs">
                        Enter
                      </kbd>
                      <span>to send</span>
                      <span className="mx-1">•</span>
                      <kbd className="px-2 py-1 bg-slate-700/50 rounded text-xs">
                        Shift + Enter
                      </kbd>
                      <span>for new line</span>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        reply.trim().length > 0
                          ? "btn-primary-gradient text-white hover:shadow-lg"
                          : "bg-slate-700/50 text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={sendComment}
                      disabled={reply.trim().length <= 0}
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Replies list */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {repliesForPost.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-sm">
                    No replies yet. Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                repliesForPost.map((comment, index) => (
                  <Reply key={`${comment.id}-${index}`} comment={comment} />
                ))
              )}

              {/* AI thinking indicator */}
              {aiThinkingPosts.has(post.id) && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-cyan-500/30 animate-pulse">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-cyan-400 animate-spin"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-cyan-400 font-medium">
                        AI Debaters
                      </span>
                      <span className="text-xs text-gray-400">
                        analyzing...
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Preparing thoughtful responses to your post
                    </div>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              <div className="py-2">
                <TypingIndicator />
              </div>

              <div ref={repliesEndRef} />
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}

interface ReplyProps {
  comment: import("../../types/DTO/getCommentsForPost").IPostComment;
}

export const Reply = ({ comment }: ReplyProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const timeAgo = new Date(comment.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group animate-slide-in">
      <div className="flex gap-3 p-4 rounded-xl hover:bg-slate-800/30 transition-all duration-200">
        <div className="flex-shrink-0">
          <Avatar user={comment.created_by_detail} size="sm" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-medium text-white">
              {getDisplayName(comment.created_by_detail)}
            </h4>
            <time className="text-xs text-gray-400">{timeAgo}</time>
            {comment.created_by_detail.type === "ai" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 text-xs rounded-full border border-cyan-500/30">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                AI
              </span>
            )}
          </div>

          {/* Content */}
          <div className="text-gray-100 text-sm leading-relaxed mb-3 break-words">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-1 text-xs transition-colors duration-200 ${
                isLiked ? "text-pink-400" : "text-gray-400 hover:text-pink-400"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>Like</span>
            </button>

            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors duration-200">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span>Reply</span>
            </button>

            <button className="text-xs text-gray-400 hover:text-white transition-colors duration-200">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
