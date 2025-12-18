import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import api from "./axios/instance";
import type {
  IPost,
  ITopicDetail,
  IStatistics,
  ISearchResult,
  SortOption,
} from "../../types/DTO/getPosts";

// Enhanced Posts Query
export function usePosts(sort?: SortOption, topicId?: number, search?: string) {
  const query = useQuery({
    queryKey: ["posts", sort, topicId, search],
    queryFn: () => getPostsFn(sort, topicId, search),
  });
  return query;
}

const getPostsFn = async (
  sort?: SortOption,
  topicId?: number,
  search?: string
) => {
  const params = new URLSearchParams();
  if (sort) params.append("sort", sort);
  if (topicId) params.append("topic", topicId.toString());
  if (search) params.append("search", search);

  const res: AxiosResponse<IPost[]> = await api.get(
    `/posts/?${params.toString()}`
  );
  return res.data;
};

// Trending Posts Query
export function useTrendingPosts() {
  const query = useQuery({
    queryKey: ["trending-posts"],
    queryFn: getTrendingPostsFn,
  });
  return query;
}

const getTrendingPostsFn = async () => {
  const res: AxiosResponse<IPost[]> = await api.get("/trending-posts/");
  return res.data;
};

// Topics Query
export function useTopics(search?: string) {
  const query = useQuery({
    queryKey: ["topics", search],
    queryFn: () => getTopicsFn(search),
  });
  return query;
}

const getTopicsFn = async (search?: string) => {
  const endpoint = search
    ? `/search-topics/?q=${encodeURIComponent(search)}`
    : "/topics/";
  const res: AxiosResponse<ITopicDetail[]> = await api.get(endpoint);
  return res.data;
};

// Statistics Query
export function useStatistics() {
  const query = useQuery({
    queryKey: ["statistics"],
    queryFn: getStatisticsFn,
  });
  return query;
}

const getStatisticsFn = async () => {
  const res: AxiosResponse<IStatistics> = await api.get("/statistics/");
  return res.data;
};

// Search Query
export function useSearch(query: string) {
  const searchQuery = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchFn(query),
    enabled: !!query.trim(),
  });
  return searchQuery;
}

const searchFn = async (query: string) => {
  const [postsRes, topicsRes] = await Promise.all([
    api.get(`/posts/?search=${encodeURIComponent(query)}`),
    api.get(`/search-topics/?q=${encodeURIComponent(query)}`),
  ]);

  return {
    posts: postsRes.data,
    topics: topicsRes.data,
  } as ISearchResult;
};

// Reaction Mutations
export function useToggleReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      type,
    }: {
      postId: number;
      type: "like" | "dislike";
    }) => toggleReactionFn(postId, type),
    onSuccess: () => {
      // Invalidate and refetch posts data
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["trending-posts"] });
    },
  });
}

const toggleReactionFn = async (postId: number, type: "like" | "dislike") => {
  const res = await api.post(`/reaction/toggle/`, { post_id: postId, type });
  return res.data;
};

// Bookmark Mutations
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => toggleBookmarkFn(postId),
    onSuccess: () => {
      // Invalidate and refetch posts data
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

const toggleBookmarkFn = async (postId: number) => {
  const res = await api.post(`/bookmark/toggle/`, { post_id: postId });
  return res.data;
};

// View Tracking
export function useTrackView() {
  return useMutation({
    mutationFn: (postId: number) => trackViewFn(postId),
  });
}

const trackViewFn = async (postId: number) => {
  const res = await api.post(`/track-view/`, { post_id: postId });
  return res.data;
};

// Legacy function for backward compatibility
export default function getPosts() {
  const query = useQuery({ queryKey: ["posts"], queryFn: () => getPostsFn() });
  return query;
}
