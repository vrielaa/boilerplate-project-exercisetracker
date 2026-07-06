export const createUserModel = (database) => ({
  async create(username) {
    const result = await database.run(
      `
        INSERT INTO users (username)
        VALUES (?)
      `,
      username,
    );

    return this.findById(result.lastID);
  },

  async findAll() {
    const users = await database.all(`
      SELECT id, username
      FROM users
      ORDER BY id
    `);

    return users.map(toUser);
  },

  async findById(id) {
    const user = await database.get(
      `
        SELECT id, username
        FROM users
        WHERE id = ?
      `,
      id,
    );

    return user ? toUser(user) : null;
  },

  async findByUsername(username) {
    const user = await database.get(
      `
        SELECT id, username
        FROM users
        WHERE username = ?
      `,
      username,
    );

    return user ? toUser(user) : null;
  },
});

const toUser = (user) => ({
  id: user.id,
  username: user.username,
});
