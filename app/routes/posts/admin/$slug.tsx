import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Link,
  Form,
  useActionData,
  useTransition,
  useLoaderData,
  useCatch,
  useParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { Form as FormAnt, Input, Button } from "antd";

import {
  createPost,
  deletePost,
  getPost,
  Post,
  updatePost,
} from "~/models/post.server";
import { requireAdminUser } from "~/session.server";

const { TextArea } = Input;

type LoaderData = { post: Post };

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  if (params.slug === "new") {
    return json({});
  }

  invariant(params.slug, "Post ID is required");

  const post = await getPost(params.slug);

  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>({ post });
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);

  // TODO: remove me
  await new Promise((res) => setTimeout(res, 1000));

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    invariant(params?.slug, "Slug must be specified");
    await deletePost(params.slug);
    return redirect("/posts/admin");
  }

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  if (params.slug === "new") {
    await createPost({ title, slug, markdown });
  } else {
    // TODO: Update post
    invariant(params?.slug, "Slug must be specified");
    await updatePost(params.slug, { title, slug, markdown });
  }

  return redirect("/posts/admin");
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function NewPost() {
  const errors = useActionData() as ActionData;

  const { post } = useLoaderData() as LoaderData;

  const transition = useTransition();
  // const isCreating = Boolean(transition.submission);
  const isCreating =
    transition?.submission?.formData?.get("intent") === "create";
  const isUpdating =
    transition?.submission?.formData?.get("intent") === "update";
  const isDeleting =
    transition?.submission?.formData?.get("intent") === "delete";

  const isNewPost = !post;

  return (
    <Form method="post" key={post?.slug || "new"}>
      {/* <FormAnt.Item
        label="Post Title:"
        name="title"
        rules={[{ required: true, message: errors?.title || "asdasd" }]}
      >
        <Input />
      </FormAnt.Item> */}
      <p>
        <Input
          placeholder="Post Title:"
          name="title"
          defaultValue={post?.title}
        />
        <label>
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
        </label>
      </p>
      <p>
        <Input placeholder="Post Slug:" name="slug" defaultValue={post?.slug} />
        <label>
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
        </label>
      </p>
      <p>
        <TextArea
          placeholder="Markdown:"
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
          defaultValue={post?.markdown}
        />
        <label htmlFor="markdown">
          {errors?.markdown ? (
            <em className="text-red-600">{errors.markdown}</em>
          ) : null}
        </label>
      </p>
      <div className="flex justify-end gap-4">
        {!isNewPost && (
          <Button
            htmlType="submit"
            danger
            name="intent"
            value="delete"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Post"}
          </Button>
        )}
        <Button
          htmlType="submit"
          type="primary"
          disabled={isCreating || isUpdating}
          name="intent"
          value={isNewPost ? "create" : "update"}
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create Post") : null}
          {isNewPost ? null : isUpdating ? "Updating..." : "Update Post"}
        </Button>
      </div>
    </Form>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <div>Uh no! The post with the slug "{params.slug}" doesn't exist.</div>
    );
  }
  throw new Error(`Unsupported throw response status code : ${caught.status}`);
}
