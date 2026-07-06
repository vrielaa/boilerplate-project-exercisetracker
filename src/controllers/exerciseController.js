export const createExerciseController = (exerciseService) => ({
  async addExercise(req, res) {
    const exercise = await exerciseService.addExercise(
      req.params._id,
      req.body,
    );

    res.json(exercise);
  },

  async getUserLog(req, res) {
    const log = await exerciseService.getUserLog(req.params._id, req.query);

    res.json(log);
  },
});
