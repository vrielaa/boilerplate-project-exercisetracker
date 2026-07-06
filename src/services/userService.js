import { badRequest, notFound } from "../utils/httpErrors.js";

export const createUserService = (userModel) => ({
  async createUser(username) {
    const existingUser = await userModel.findByUsername(username);

    if (existingUser) {
      throw badRequest("username already exists");
    }

    return userModel.create(username);
  },

  listUsers() {
    return userModel.findAll();
  },

  async getUser(id) {
    const user = await userModel.findById(id);

    if (!user) {
      throw notFound("User not found");
    }

    return user;
  },
});
