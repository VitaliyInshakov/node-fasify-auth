import fastify from"fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "cross-fetch";
import https from "https";

const app = fastify();

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function startApp() {
    try {
        app.register(fastifyStatic, {
            root: path.join(__dirname, "public"),
        });

        app.get("/verify/:email/:token", async (request, reply) => {
            try {
                const { email, token } = request.params;
                const httpsAgent = new https.Agent({
                    rejectUnauthorized: false,
                });
                const res = await fetch("https://api.nodeauth.dev/api/verify", {
                    method: "POST",
                    body: JSON.stringify({ email, token }),
                    credentials: "include",
                    agent: httpsAgent,
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                });

                if (res.status === 200) {
                    reply.redirect("/");
                }
            } catch (e) {
                console.error("Verify email api route", e);
                reply.send({ data: { status: "FAILED"} });
            }
        });

        app.get("/reset/:email/:exp/:token", async (request, reply) => {
            return reply.sendFile("reset.html");
        });

        await app.listen(5000);
        console.log("Server listening at port: 5000");
    } catch (e) {
        console.error("Something went wrong when trying start UI server", e);
    }
}

startApp();