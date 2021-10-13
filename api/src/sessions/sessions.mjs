import { client } from "../db.mjs";

export const session = client.db("test").collection("session");

session.createIndex({ sessionToken: 1 });