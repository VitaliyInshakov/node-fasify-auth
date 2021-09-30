const { client } = require("../db");

const session = client.db("test").collection("session");
module.exports = { session };