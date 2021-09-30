const { client } = require("../db");

const user = client.db("test").collection("user");
module.exports = { user };