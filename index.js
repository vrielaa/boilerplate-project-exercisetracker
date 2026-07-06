import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { ExerciseStore } from "./src/sqliteStore.js";
import {
  badRequest,
  formatExerciseDate,
  parseDateParam,
  parseLimitParam,
  parseRequiredText,
  parsePositiveInteger,
} from "./src/validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const store = await ExerciseStore.create(
  path.join(__dirname, "data", "exercise-tracker.sqlite"),
);

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/api/users", async (req, res, next) => {
  try {
    const username = parseRequiredText(req.body.username, "username");
    const user = await store.createUser(username);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

app.get("/api/users", async (req, res, next) => {
  try {
    res.json(await store.listUsers());
  } catch (error) {
    next(error);
  }
});

app.post("/api/users/:_id/exercises", async (req, res, next) => {
  try {
    const user = await getUserOrFail(req.params._id);
    const description = parseRequiredText(req.body.description, "description");
    const duration = parsePositiveInteger(req.body.duration, "duration");
    const exerciseDate =
      parseDateParam(req.body.date, "date") || formatExerciseDate(new Date());

    await store.addExercise(user._id, {
      description,
      duration,
      dateKey: exerciseDate.key,
      date: exerciseDate.value,
    });

    res.json({
      username: user.username,
      description,
      duration,
      date: exerciseDate.value,
      _id: user._id,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:_id/logs", async (req, res, next) => {
  try {
    const user = await getUserOrFail(req.params._id);
    const from = parseDateParam(req.query.from, "from");
    const to = parseDateParam(req.query.to, "to");
    const limit = parseLimitParam(req.query.limit);

    if (from && to && from.key > to.key) {
      throw badRequest("from must be on or before to");
    }

    const { count, exercises } = await store.listExercisesForUser(user._id, {
      from: from?.key,
      to: to?.key,
      limit,
    });

    res.json({
      username: user.username,
      count,
      _id: user._id,
      log: exercises.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : error.message,
  });
});

async function getUserOrFail(id) {
  const user = await store.findUser(id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
}

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
