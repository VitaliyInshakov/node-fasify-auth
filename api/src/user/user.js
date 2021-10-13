const { client } = require("../db.mjs");

const user = client.db("test").collection("user");
user.createIndex({ "email.address": 1 });
module.exports = { user };