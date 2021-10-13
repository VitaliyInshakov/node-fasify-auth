import fastify from"fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { fileURLToPath } from "url";

const app = fastify();

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function startApp() {
    try {
        app.register(fastifyStatic, {
            root: path.join(__dirname, "public"),
        });

        await app.listen(5000);
        console.log("Server listening at port: 5000");
    } catch (e) {
        console.error(e);
    }
}

startApp();