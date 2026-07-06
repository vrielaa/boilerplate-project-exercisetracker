import { parseRequiredText } from "../validation.js";

export const createUserController = (userService) => ({
  async createUser(req, res) {
    const username = parseRequiredText(req.body.username, "username");
    const user = await userService.createUser(username);

    res.json(user);
  },

  async listUsers(req, res) {
    res.json(await userService.listUsers());
  },
});
