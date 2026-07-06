import fs from 'fs'
import path from 'path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export class ExerciseStore {
  constructor(database) {
    this.database = database
  }

  static async create(databasePath) {
    ensureDirectory(path.dirname(databasePath))

    const database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    await database.exec('PRAGMA foreign_keys = ON')
    await database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE
      )
    `)
    await database.exec(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        duration INTEGER NOT NULL,
        date_key TEXT NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    await database.exec(`
      CREATE INDEX IF NOT EXISTS exercises_user_id_idx
      ON exercises (user_id)
    `)
    await database.exec(`
      CREATE INDEX IF NOT EXISTS exercises_user_date_idx
      ON exercises (user_id, date_key)
    `)

    return new ExerciseStore(database)
  }

  async listUsers() {
    const users = await this.database.all(`
      SELECT id, username
      FROM users
      ORDER BY id
    `)

    return users.map(publicUser)
  }

  async findUser(id) {
    const user = await this.database.get(
      `
        SELECT id, username
        FROM users
        WHERE id = ?
      `,
      id,
    )

    return user ? publicUser(user) : null
  }

  async findUserByUsername(username) {
    const user = await this.database.get(
      `
        SELECT id, username
        FROM users
        WHERE username = ?
      `,
      username,
    )

    return user ? publicUser(user) : null
  }

  async createUser(username) {
    const result = await this.database.run(
      `
        INSERT INTO users (username)
        VALUES (?)
      `,
      username,
    )
    const user = await this.findUser(result.lastID)

    return user
  }

  async addExercise(userId, exerciseInput) {
    const result = await this.database.run(
      `
        INSERT INTO exercises (user_id, description, duration, date_key, date)
        VALUES (?, ?, ?, ?, ?)
      `,
      userId,
      exerciseInput.description,
      exerciseInput.duration,
      exerciseInput.dateKey,
      exerciseInput.date,
    )

    return {
      id: result.lastID,
      userId: Number(userId),
      description: exerciseInput.description,
      duration: exerciseInput.duration,
      dateKey: exerciseInput.dateKey,
      date: exerciseInput.date,
    }
  }

  async listExercisesForUser(userId, filters = {}) {
    const from = filters.from || null
    const to = filters.to || null
    const countRow = await this.database.get(
      `
        SELECT COUNT(*) AS count
        FROM exercises
        WHERE user_id = ?
          AND (? IS NULL OR date_key >= ?)
          AND (? IS NULL OR date_key <= ?)
      `,
      userId,
      from,
      from,
      to,
      to,
    )

    const hasLimit = filters.limit !== undefined && filters.limit !== null
    let exercises

    if (hasLimit) {
      exercises = await this.database.all(
        `
          SELECT id, description, duration, date_key AS dateKey, date
          FROM exercises
          WHERE user_id = ?
            AND (? IS NULL OR date_key >= ?)
            AND (? IS NULL OR date_key <= ?)
          ORDER BY id
          LIMIT ?
        `,
        userId,
        from,
        from,
        to,
        to,
        filters.limit,
      )
    } else {
      exercises = await this.database.all(
        `
          SELECT id, description, duration, date_key AS dateKey, date
          FROM exercises
          WHERE user_id = ?
            AND (? IS NULL OR date_key >= ?)
            AND (? IS NULL OR date_key <= ?)
          ORDER BY id
        `,
        userId,
        from,
        from,
        to,
        to,
      )
    }

    return {
      count: countRow.count,
      exercises: exercises.map(publicExercise),
    }
  }
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
  }
}

function publicExercise(exercise) {
  return {
    id: exercise.id,
    description: exercise.description,
    duration: exercise.duration,
    dateKey: exercise.dateKey,
    date: exercise.date,
  }
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true })
}
