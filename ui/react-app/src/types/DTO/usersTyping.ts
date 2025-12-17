export interface UsersTyping {
  type: "post_users_typing";
  message: Array<string>;
  post_id: number;
}
