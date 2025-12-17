import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import api from "./axios/instance";
import type { IPost } from "../../types/DTO/getPosts";

export default function getPosts() {
  const query = useQuery({ queryKey: ["posts"], queryFn: getPostsFn });
  return query;
}

const getPostsFn = async () => {
  const res: AxiosResponse<IPost[]> = await api.get("/posts/");
  return res.data;
};
