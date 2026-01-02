import { create } from "zustand";
import type { IPostComment } from "../types/DTO/getCommentsForPost";

interface GlobalStoreState {
  postReplies: { [key: number]: Array<IPostComment> };
  setPostReplies: (replies: { [key: number]: Array<IPostComment> }) => void;
  aiThinkingPosts: Set<number>;
  setAiThinking: (postId: number, thinking: boolean) => void;
}

export const useGlobalStore = create<GlobalStoreState>((set) => ({
  postReplies: {},
  setPostReplies: (replies: { [key: number]: Array<IPostComment> }) =>
    set({ postReplies: replies }),
  aiThinkingPosts: new Set(),
  setAiThinking: (postId: number, thinking: boolean) =>
    set((state) => {
      const newThinkingPosts = new Set(state.aiThinkingPosts);
      if (thinking) {
        newThinkingPosts.add(postId);
      } else {
        newThinkingPosts.delete(postId);
      }
      return { aiThinkingPosts: newThinkingPosts };
    }),
}));
