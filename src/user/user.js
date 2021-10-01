const { client } = require("../db");

const user = client.db("test").collection("user");
user.createIndex({ "email.address": 1 });
module.exports = { user };