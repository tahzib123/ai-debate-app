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
}

export interface IPost {
  id: number;
  created_by_detail: IUserDetail;
  topic_detail: ITopicDetail;
  content: string;
  updated_at: string;
}
