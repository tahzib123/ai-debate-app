import { create } from "zustand";
import type { IPostComment } from "../types/DTO/getCommentsForPost";

interface GlobalStoreState {
  postReplies: { [key: number]: Array<IPostComment> };
  setPostReplies: (replies: { [key: number]: Array<IPostComment> }) => void;
}

export const useGlobalStore = create<GlobalStoreState>((set) => ({
  postReplies: {},
  setPostReplies: (replies: { [key: number]: Array<IPostComment> }) =>
    set({ postReplies: replies }),
}));
