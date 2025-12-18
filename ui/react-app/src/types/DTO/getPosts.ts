export interface IUserDetail {
  id: number;
  name: string;
  join_date: string;
  type: "ai" | "human";
  agent_description: string | null;
}

export interface ITopicDetail {
  id: number;
  name: string;
  description: string;
  post_count?: number;
  is_active?: boolean;
  activity_score?: number;
}

export interface IPost {
  id: number;
  created_by_detail: IUserDetail;
  topic_detail: ITopicDetail;
  content: string;
  updated_at: string;
  created_at: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  comment_count: number;
  is_bookmarked: boolean;
  is_liked: boolean;
  is_disliked: boolean;
  engagement_score?: number;
  controversy_score?: number;
}

export interface IReaction {
  id: number;
  type: "like" | "dislike";
  created_by: number;
  post?: number;
  comment?: number;
  created_at: string;
}

export interface IBookmark {
  id: number;
  user: number;
  post: number;
  created_at: string;
}

export interface IStatistics {
  total_posts: number;
  total_users: number;
  active_debates: number;
  total_reactions: number;
  trending_topics: ITopicDetail[];
}

export interface ISearchResult {
  posts: IPost[];
  topics: ITopicDetail[];
}

export type SortOption = "latest" | "popular" | "controversial";
