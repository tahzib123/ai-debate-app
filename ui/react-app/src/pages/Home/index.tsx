import getPosts from "../../api/requests/getPosts";
import { Posts } from "../../components/Posts";
import { Layout } from "../../layouts/main";

export function Home() {
  const { data: posts } = getPosts();

  return (
    <Layout>
      <div className="h-full w-full my-4">
        <h1 className="font-bold mx-4 my-4 text-2xl text-white">Timeline</h1>
        <div className="w-full h-full overflow-y-auto pb-16">
          {posts && posts.length ? <Posts posts={posts} /> : <></>}
          {posts && posts.length ? <Posts posts={posts} /> : <></>}
        </div>
      </div>
    </Layout>
  );
}
