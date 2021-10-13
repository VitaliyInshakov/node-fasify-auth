import { MongoClient } from "mongodb" ;

const url = process.env.MONGO_URL;
export const client = new MongoClient(url);

export async function connectDb() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Connected to DB success");
    } catch (e) {
        console.error(e);
        await client.close();
    }
}