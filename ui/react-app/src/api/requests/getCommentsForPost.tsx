import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import api from "./axios/instance";
import type { IPostComment } from "../../types/DTO/getCommentsForPost";

export default function getCommentsForPost(
  postId: string,
  options?: Partial<UseQueryOptions<IPostComment[], Error>>
) {
  const query = useQuery<IPostComment[]>({
    queryKey: ["comments", postId],
    queryFn: () => getPostsFn(postId),
    enabled: !!postId && options?.enabled,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
  return query;
}

const getPostsFn = async (postId: string) => {
  const res: AxiosResponse<IPostComment[]> = await api.get(
    `/post/${postId}/comments/`
  );
  return res.data;
};
