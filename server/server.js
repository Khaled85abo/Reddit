// npx prisma migrate dev
// npx prisma db seed
// c + p >typescript: restart ts server
import fastify from "fastify";
import sensible from "@fastify/sensible";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();
const app = fastify();
app.register(sensible);
app.register(cookie, { secret: process.env.COOKIE_SECRET });
await app.register(cors, {
  // origin: "http://localhost:3000",
  origin: process.env.CLIENT_URL,
  // origin: (origin, cb) => {
  //   const hostname = new URL(origin).hostname;
  //   console.log(origin);
  //   if (hostname === "localhost") {
  //     //  Request from localhost will pass
  //     cb(null, true);
  //     return;
  //   }
  //   // Generate an error on other origins, disabling access
  //   cb(new Error("Not allowed"), false);
  // },
  credentials: true,
});

// app.register(cors);

app.addHook("onRequest", (req, res, done) => {
  if (req.cookies.userId !== CURRENT_USER_ID) {
    req.cookies.userId = CURRENT_USER_ID;
    res.clearCookie("userId");
    res.setCookie("userId", CURRENT_USER_ID);
  }
  done();
});

const prisma = new PrismaClient();
const CURRENT_USER_ID = (
  await prisma.user.findFirst({ where: { name: "Kyle" } })
).id;
const COMMETN_SELECT_FIELDS = {
  createdAt: true,
  id: true,
  message: true,
  parentId: true,
  user: {
    select: {
      id: true,
      name: true,
    },
  },
};
app.get("/posts", async (req, res) => {
  return await commitToDb(
    prisma.post.findMany({
      select: {
        id: true,
        title: true,
        _count: { select: { comments: true } },
      },
    })
  );
});

app.get("/posts/:id", async (req, res) => {
  return await commitToDb(
    prisma.post
      .findUnique({
        where: { id: req.params.id },
        select: {
          body: true,
          title: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          comments: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              ...COMMETN_SELECT_FIELDS,
              _count: { select: { likes: true } },
            },
          },
        },
      })
      .then(async (post) => {
        const likes = await prisma.like.findMany({
          where: {
            userId: req.cookies.userId,
            commentId: { in: post.comments.map((comment) => comment.id) },
          },
        });

        return {
          ...post,
          comments: post.comments.map((comment) => {
            const { _count, ...commentFields } = comment;
            return {
              ...commentFields,
              likedByMe: likes.find((like) => like.commentId === comment.id),
              likeCount: _count.likes,
            };
          }),
        };
      })
  );
});

app.post("/posts/:id/comments", async (req, res) => {
  if (req.body.message === "" || req.body.message == null) {
    return res.send(app.httpErrors.badRequest("Message is required"));
  }

  return await commitToDb(
    prisma.comment
      .create({
        data: {
          message: req.body.message,
          userId: req.cookies.userId,
          parentId: req.body.parentId,
          postId: req.params.id,
        },
        select: COMMETN_SELECT_FIELDS,
      })
      .then((comment) => {
        return {
          ...comment,
          likeCount: 0,
          likedByMe: false,
        };
      })
  );
});

app.put("/posts/:postId/comments/:commentId", async (req, res) => {
  if (req.body.message === "" || req.body.message == null) {
    return res.send(app.httpErrors.badRequest("Message is required"));
  }
  const { userId } = await prisma.comment.findUnique({
    where: {
      id: req.params.commentId,
    },
    select: { userId: true },
  });

  if (userId !== req.cookies.userId) {
    return res.send(
      app.httpErrors.unauthorized("you don't have permissin to edit!")
    );
  }

  return await commitToDb(
    prisma.comment.update({
      where: { id: req.params.commentId },
      data: {
        message: req.body.message,
      },
      select: { message: true },
    })
  );
});

app.delete("/posts/:postId/comments/:commentId", async (req, res) => {
  const { userId } = await prisma.comment.findUnique({
    where: {
      id: req.params.commentId,
    },
    select: { userId: true },
  });

  if (userId !== req.cookies.userId) {
    return res.send(
      app.httpErrors.unauthorized("you don't have permissin to delete!")
    );
  }

  return await commitToDb(
    prisma.comment.delete({
      where: { id: req.params.commentId },
      select: { id: true },
    })
  );
});

app.post("/posts/:postId/comments/:commentId/toggleLike", async (req, res) => {
  const data = {
    commentId: req.params.commentId,
    userId: req.cookies.userId,
  };
  const like = await prisma.like.findUnique({
    where: { userId_commentId: data },
  });
  if (like == null) {
    return await commitToDb(
      prisma.like.create({ data }).then(() => {
        return { addedLike: true };
      })
    );
  } else {
    return await commitToDb(
      prisma.like.delete({ where: { userId_commentId: data } }).then(() => {
        return { addedLike: false };
      })
    );
  }
});
async function commitToDb(promise) {
  const [error, data] = await app.to(promise);
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
}
app.listen({ port: process.env.PORT });
