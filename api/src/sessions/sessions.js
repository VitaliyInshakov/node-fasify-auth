const { client } = require("../db");

const session = client.db("test").collection("session");

session.createIndex({ sessionToken: 1 });
module.exports = { session };