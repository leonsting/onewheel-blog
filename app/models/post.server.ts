import { prisma } from "~/db.server";

export type { Post } from "@prisma/client";

export async function getPostsListing() {
  return prisma.post.findMany({
    select: {
      slug: true,
      title: true,
    },
  });
}

export async function getPosts() {
  // const posts = [
  //   { slug: "my-first-post", title: "My First Post!" },
  //   { slug: "my-second-post", title: "My Second Post!" },
  // ];
  return prisma.post.findMany();
}

export async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}
