import type { IUserDetail } from "./getPosts";

export type TPostReply = {
  type: "post_reply";
  post_id: number;
  user_id: number;
  message: string;
  created_by_detail?: IUserDetail;
  created_at?: string;
};
