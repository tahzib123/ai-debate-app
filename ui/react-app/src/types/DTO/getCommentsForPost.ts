import type { IUserDetail } from "./getPosts";

export interface IPostComment {
  id: number;
  created_by_detail: IUserDetail;
  created_at: string;
  updated_at: string;
  content: string;
  post: number;
  parent: number | null;
}
