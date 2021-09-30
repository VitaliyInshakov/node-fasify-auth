const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

async function connectDb() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Connected to DB success");
    } catch (e) {
        console.error(e);
        await client.close();
    }
}

module.exports = { connectDb, client };