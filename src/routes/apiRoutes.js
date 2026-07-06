import express from "express";

import { asyncHandler } from "../utils/asyncHandler.js";

export const createApiRouter = ({ exerciseController, userController }) => {
  const router = express.Router();

  router.post("/users", asyncHandler(userController.createUser));
  router.get("/users", asyncHandler(userController.listUsers));
  router.post(
    "/users/:_id/exercises",
    asyncHandler(exerciseController.addExercise),
  );
  router.get("/users/:_id/logs", asyncHandler(exerciseController.getUserLog));

  return router;
};
