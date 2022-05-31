import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction } from "@remix-run/node";

import { getPostsListing } from "~/models/post.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPostsListing>>;
};

export const loader: LoaderFunction = async () => {
  const posts = await getPostsListing();
  return json<LoaderData>({ posts });
};

export default function PostsRoute() {
  const { posts } = useLoaderData() as LoaderData;
  console.log(posts);
  return (
    <main>
      <h1>Posts</h1>
      <Link to="admin" className="text-red-600 underline">
        Admin
      </Link>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={post.slug} className="text-blue-600 underline">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
