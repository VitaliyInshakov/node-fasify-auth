const fastify = require("fastify");
const fastifyStatic = require("fastify-static");
const path = require("path");

const app = fastify();

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