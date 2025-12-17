import { create } from "zustand";

interface GlobalStoreState {
  postReplies: { [key: number]: Array<string> };
  setPostReplies: (replies: { [key: number]: Array<string> }) => void;
}

export const useGlobalStore = create<GlobalStoreState>((set) => ({
  postReplies: {},
  setPostReplies: (replies: { [key: number]: Array<string> }) =>
    set({ postReplies: replies }),
}));
