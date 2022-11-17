// npx prisma migrate dev
// npx prisma db seed
// c + p >typescript: restart ts server
import fastify from "fastify";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();
const app = fastify();
app.register(sensible);

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
const primsa = new PrismaClient();

app.get("/posts", async (req, res) => {
  return await commitToDb(
    primsa.post.findMany({
      select: {
        id: true,
        title: true,
      },
    })
  );
});

app.get("/posts/:id", async (req, res) => {
  return await commitToDb(
    primsa.post.findUnique({
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
            id: true,
            message: true,
            parentId: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
  );
});

async function commitToDb(promise) {
  const [error, data] = await app.to(promise);
  if (error) return app.httpErrors.internalServerError(error.message);
  return data;
}
app.listen({ port: process.env.PORT });
