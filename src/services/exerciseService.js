import {
  formatExerciseDate,
  parseDateParam,
  parseLimitParam,
  parsePositiveInteger,
  parseRequiredText,
} from "../validation.js";
import { badRequest } from "../utils/httpErrors.js";

export const createExerciseService = ({ exerciseModel, userService }) => ({
  async addExercise(userId, exerciseBody) {
    const user = await userService.getUser(userId);
    const description = parseRequiredText(
      exerciseBody.description,
      "description",
    );
    const duration = parsePositiveInteger(exerciseBody.duration, "duration");
    const exerciseDate =
      parseDateParam(exerciseBody.date, "date") ||
      formatExerciseDate(new Date());
    const exercise = await exerciseModel.create(user.id, {
      description,
      duration,
      dateKey: exerciseDate.key,
      date: exerciseDate.value,
    });

    return {
      userId: user.id,
      exerciseId: exercise.id,
      duration: exercise.duration,
      description: exercise.description,
      date: exercise.date,
    };
  },

  async getUserLog(userId, query) {
    const user = await userService.getUser(userId);
    const from = parseDateParam(query.from, "from");
    const to = parseDateParam(query.to, "to");
    const limit = parseLimitParam(query.limit);

    if (from && to && from.key > to.key) {
      throw badRequest("from must be on or before to");
    }

    const filters = {
      from: from?.key,
      to: to?.key,
      limit,
    };
    const count = await exerciseModel.countForUser(user.id, filters);
    const exercises = await exerciseModel.findForUser(user.id, filters);

    return {
      username: user.username,
      id: user.id,
      count,
      logs: exercises.map((exercise) => ({
        id: exercise.id,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date,
      })),
    };
  },
});
