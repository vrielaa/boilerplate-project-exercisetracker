export const createExerciseModel = (database) => ({
  async create(userId, exerciseInput) {
    const result = await database.run(
      `
        INSERT INTO exercises (user_id, description, duration, date_key, date)
        VALUES (?, ?, ?, ?, ?)
      `,
      userId,
      exerciseInput.description,
      exerciseInput.duration,
      exerciseInput.dateKey,
      exerciseInput.date,
    );

    return {
      id: result.lastID,
      userId: Number(userId),
      description: exerciseInput.description,
      duration: exerciseInput.duration,
      dateKey: exerciseInput.dateKey,
      date: exerciseInput.date,
    };
  },

  async countForUser(userId, filters = {}) {
    let query = `
      SELECT COUNT(*) AS count
      FROM exercises
      WHERE user_id = ?
    `;
    const params = [userId];

    if (filters.from) {
      query += " AND date_key >= ?";
      params.push(filters.from);
    }

    if (filters.to) {
      query += " AND date_key <= ?";
      params.push(filters.to);
    }

    const row = await database.get(query, ...params);

    return row.count;
  },

  async findForUser(userId, filters = {}) {
    let query = `
      SELECT id, description, duration, date_key AS dateKey, date
      FROM exercises
      WHERE user_id = ?
    `;
    const params = [userId];

    if (filters.from) {
      query += " AND date_key >= ?";
      params.push(filters.from);
    }

    if (filters.to) {
      query += " AND date_key <= ?";
      params.push(filters.to);
    }

    query += " ORDER BY id";

    if (filters.limit !== undefined && filters.limit !== null) {
      query += " LIMIT ?";
      params.push(filters.limit);
    }

    const exercises = await database.all(query, ...params);

    return exercises.map(toExercise);
  },
});

const toExercise = (exercise) => ({
  id: exercise.id,
  description: exercise.description,
  duration: exercise.duration,
  dateKey: exercise.dateKey,
  date: exercise.date,
});
