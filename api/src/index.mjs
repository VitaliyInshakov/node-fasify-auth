import "./env.mjs"
import fastify from"fastify";
import fastifyStatic from "fastify-static";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDb } from "./db.mjs";
import { registerUser }from "./accounts/register.mjs";
import { loginUser }from "./accounts/login.mjs";
import { logUserIn }from "./accounts/logUserIn.mjs";
import { logUserOut }from "./accounts/logUserOut.mjs";
import { getUserFromCookies }from "./accounts/user.mjs";
import { createVerifyEmailLink }from "./accounts/verify.mjs";
import { MailSender }from "./mail/index.mjs";

const app = fastify();

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function startApp() {
    try {
        await MailSender.init();

        app.register(fastifyCors, {
            origin: [
                /\.nodeauth.dev/,
                "https://nodeauth.dev",
            ],
            credentials: true,
        });

        app.register(fastifyStatic, {
            root: path.join(__dirname, "public"),
        });

        app.register(fastifyCookie, {
            secret: process.env.COOKIE_SIGNATURE,
        });

        app.post("/api/register", {}, async (request, reply) => {
            try {
                const userId = await registerUser(request.body.email, request.body.password);
                if (userId) {
                    const emailLink = await createVerifyEmailLink(request.body.email);
                    await MailSender.sendEmail({
                        to: request.body.email,
                        subject: "Verify your email",
                        html: `<a href="${emailLink}">Verify</a>`,
                    });

                    await loginUser(request.body.email, request.body.password);
                    reply.send({ data: { status: "SUCCESS", userId } });
                }

                reply.send({ data: { status: "FAILED"} });
            } catch (e) {
                console.error(e);
            }
        });

        app.post("/api/login", {}, async (request, reply) => {
            try {
                const { isAuthorized, userId } = await loginUser(request.body.email, request.body.password);

                if (isAuthorized)  {
                    await logUserIn(userId, request, reply);
                    reply.send({ data: { status: "SUCCESS", userId } });
                }

                reply.send({ data: { status: "FAILED"} });
            } catch (e) {
                console.error(e);
            }
        });

        app.post("/api/logout", async (request, reply) => {
            try {
                await logUserOut(request, reply);
                reply.send({ data: { status: "SUCCESS" } });
            } catch (e) {
                console.error(e);
                reply.send({ data: { status: "FAILED"} });
            }
        });

        app.get("/test", {}, async (request, reply) => {
            try {
                const user = await getUserFromCookies(request, reply);

                if (user?._id) {
                    reply.send({
                        data: user,
                    });
                } else {
                    reply.send({
                        data: "User Lookup Failed",
                    });
                }
            } catch (e) {
                console.error(e);
            }
        });

        await app.listen(3000);
        console.log("Server listening at port: 3000");
    } catch (e) {
        console.error(e);
    }
}

connectDb().then(() => startApp());