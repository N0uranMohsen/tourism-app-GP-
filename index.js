//handle programmin errors
// process.on("uncaughtException", () => {
//   console.log("error in code");
// });
import express from "express";
import cors from "cors";
import { globalErrorHandling } from "./src/middleware/globalErrorHandling.js";
import { dbConn } from "./DB/dbConn.js";
import { config } from "dotenv";
import userPrRouter from "./src/modules/userprofile/userprofile.routes.js";
import { AppError } from "./src/utils/appError.js";
import postRouter from "./src/modules/Post/post.routes.js";
import commentRouter from "./src/modules/Comments/comment.routes.js";
import authRouter from "./src/modules/auth/auth.routes.js";
import { Server } from "socket.io";
import followRouter from "./src/modules/follow/follow.routes.js";
import groupRouter from "./src/modules/Groups/groups.routes.js";
import { fileURLToPath } from "url";
import path from "path";
import { handleChatEvents } from "./src/modules/messeges/messages.controller.js";
import userRouter from "./src/modules/users/user.routes.js";
import chatRouter from "./src/modules/chatbot/chatbot.routes.js";
import {redisConnection} from "./DB/redis.config.js";

const app = express();
const port = process.env.PORT || 3000;
config({ path: "./.env" });
dbConn();
redisConnection();//!redis connection
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));
app.use("/auth", authRouter);
app.use("/myprofile", userPrRouter);
app.use("/comments", commentRouter);
app.use("/posts", postRouter);
app.use("/follow", followRouter);
app.use("/group", groupRouter);
app.use("/user", userRouter);
app.use("/chatbot", chatRouter);

// 📦 FRONTEND SETUP
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static files
app.use(express.static(path.join(__dirname, "build")));

// SPA fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use(globalErrorHandling);

// app.get("/", (req, res) => res.send("Hello World!"));

//handle unhandled routes
app.use("*", (req, res, next) => {
  next(new AppError(`route not found ${req.originalUrl}`, 404));
});

// app.all("/send-email/:email?", async (req, res) => {
//   sendEmail(req.body.email || req.params.email, "123");
//   return res.send("done");
// });

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

export const io = new Server(server, {
  cors: {
    origin: "*", //todo assign the FE server
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);
  handleChatEvents(socket);
});
