import { client } from "../db.mjs";

export const user = client.db("test").collection("user");
user.createIndex({ "email.address": 1 });