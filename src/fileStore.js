import fs from 'fs'
import path from 'path'

export class ExerciseStore {
  constructor(filePath) {
    this.filePath = filePath
    this.data = this.load()
  }

  listUsers() {
    return this.data.users.map(publicUser)
  }

  findUser(id) {
    const user = this.data.users.find((candidate) => candidate._id === String(id))

    return user ? publicUser(user) : null
  }

  createUser(username) {
    const user = {
      _id: String(this.data.nextUserId),
      username,
    }

    this.data.nextUserId += 1
    this.data.users.push(user)
    this.save()

    return publicUser(user)
  }

  addExercise(userId, exerciseInput) {
    const exercise = {
      _id: String(this.data.nextExerciseId),
      userId: String(userId),
      description: exerciseInput.description,
      duration: exerciseInput.duration,
      dateKey: exerciseInput.dateKey,
      date: exerciseInput.date,
    }

    this.data.nextExerciseId += 1
    this.data.exercises.push(exercise)
    this.save()

    return exercise
  }

  listExercisesForUser(userId) {
    return this.data.exercises.filter((exercise) => exercise.userId === String(userId))
  }

  load() {
    ensureDirectory(path.dirname(this.filePath))

    if (!fs.existsSync(this.filePath)) {
      const emptyStore = createEmptyStore()
      fs.writeFileSync(this.filePath, JSON.stringify(emptyStore, null, 2))

      return emptyStore
    }

    const parsedStore = JSON.parse(fs.readFileSync(this.filePath, 'utf8'))

    return normalizeStore(parsedStore)
  }

  save() {
    ensureDirectory(path.dirname(this.filePath))
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
  }
}

function publicUser(user) {
  return {
    username: user.username,
    _id: user._id,
  }
}

function createEmptyStore() {
  return {
    nextUserId: 1,
    nextExerciseId: 1,
    users: [],
    exercises: [],
  }
}

function normalizeStore(store) {
  const users = Array.isArray(store.users) ? store.users : []
  const exercises = Array.isArray(store.exercises) ? store.exercises : []

  return {
    nextUserId: nextId(store.nextUserId, users),
    nextExerciseId: nextId(store.nextExerciseId, exercises),
    users: users.map((user) => ({
      _id: String(user._id),
      username: String(user.username),
    })),
    exercises: exercises.map((exercise) => ({
      _id: String(exercise._id),
      userId: String(exercise.userId),
      description: String(exercise.description),
      duration: Number(exercise.duration),
      dateKey: String(exercise.dateKey),
      date: String(exercise.date),
    })),
  }
}

function nextId(candidate, records) {
  const numericCandidate = Number(candidate)
  const largestId = records.reduce((largest, record) => {
    const id = Number(record._id)

    return Number.isSafeInteger(id) && id > largest ? id : largest
  }, 0)

  if (Number.isSafeInteger(numericCandidate) && numericCandidate > largestId) {
    return numericCandidate
  }

  return largestId + 1
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true })
}
