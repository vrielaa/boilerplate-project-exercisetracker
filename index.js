import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { createApp } from "./src/app.js";
import { createDatabase } from "./src/database/database.js";
import { createExerciseController } from "./src/controllers/exerciseController.js";
import { createExerciseModel } from "./src/models/exerciseModel.js";
import { createExerciseService } from "./src/services/exerciseService.js";
import { createUserController } from "./src/controllers/userController.js";
import { createUserModel } from "./src/models/userModel.js";
import { createUserService } from "./src/services/userService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const database = await createDatabase(
  path.join(__dirname, "data", "exercise-tracker.sqlite"),
);
const userModel = createUserModel(database);
const exerciseModel = createExerciseModel(database);
const userService = createUserService(userModel);
const exerciseService = createExerciseService({ exerciseModel, userService });
const userController = createUserController(userService);
const exerciseController = createExerciseController(exerciseService);
const app = createApp({
  exerciseController,
  userController,
  rootDir: __dirname,
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
