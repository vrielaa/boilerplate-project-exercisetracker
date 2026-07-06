import path from "path";
import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { createApiRouter } from "./routes/apiRoutes.js";

export const createApp = ({ exerciseController, userController, rootDir }) => {
  const app = express();

  app.use(cors());
  app.use(express.static(path.join(rootDir, "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.sendFile(path.join(rootDir, "views", "index.html"));
  });

  app.use("/api", createApiRouter({ exerciseController, userController }));
  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
};
