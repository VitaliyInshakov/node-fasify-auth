import "./env.mjs"
import fastify from"fastify";
import fastifyStatic from "fastify-static";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import path from "path";
import { fileURLToPath } from "url";
import { authenticator } from "@otplib/preset-default";

import { connectDb } from "./db.mjs";
import { registerUser }from "./accounts/register.mjs";
import { loginUser }from "./accounts/login.mjs";
import { logUserIn }from "./accounts/logUserIn.mjs";
import { logUserOut }from "./accounts/logUserOut.mjs";
import { getUserFromCookies, changePassword, register2FA }from "./accounts/user.mjs";
import { createVerifyEmailLink, validateVerifyEmail }from "./accounts/verify.mjs";
import { createResetLink, validateResetEmail }from "./accounts/reset.mjs";
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

        app.get("/api/user", {}, async (request, reply) => {
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
                const { isAuthorized, userId, totp } = await loginUser(request.body.email, request.body.password);

                if (isAuthorized && !totp)  {
                    await logUserIn(userId, request, reply);
                    reply.send({ data: { status: "SUCCESS", userId } });
                } else if (isAuthorized && totp) {
                    reply.send({ data: { status: "2FA" } });
                }

                reply.code(401).send({ data: { status: "FAILED"} });
            } catch (e) {
                console.error(e);
                reply.code(401).send({ data: { status: "FAILED"} });
            }
        });

        app.post("/api/logout", {}, async (request, reply) => {
            try {
                await logUserOut(request, reply);
                reply.send({ data: { status: "SUCCESS" } });
            } catch (e) {
                console.error(e);
                reply.send({ data: { status: "FAILED"} });
            }
        });

        app.post("/api/verify", {}, async (request, reply) => {
            try {
                const { email, token } = request.body;
                const isValid = await validateVerifyEmail(token, email);
                if (isValid) {
                    reply.code(200).send();
                }

                reply.code(401).send();
            } catch (e) {
                console.error(e);
                reply.code(401).send();
            }
        });

        app.post("/api/change-password", {}, async (request, reply) => {
            try {
                const user = await getUserFromCookies(request, reply);
                if (user?.email?.address) {
                    const { isAuthorized, userId } = await loginUser(user.email.address, request.body.oldPassword);
                    if (isAuthorized) {
                        await changePassword(userId, request.body.newPassword);
                        reply.code(200).send();
                    }
                }

                reply.code(401).send();
            } catch (e) {
                console.error(e);
                reply.code(401).send();
            }
        });

        app.post("/api/forgot-password", {}, async (request, reply) => {
            try {
                const { email } = request.body;
                const link = await createResetLink(email);

                if (link) {
                    await MailSender.sendEmail({
                        to: email,
                        subject: "Reset your password",
                        html: `<a href="${link}">Reset</a>`,
                    });
                }

                reply.code(200).send();
            } catch (e) {
                console.error(e);
                reply.code(401).send();
            }
        });

        app.post("/api/reset-password", {}, async (request, reply) => {
            try {
                const { email, password, token, time } = request.body;
                const isValid = await validateResetEmail(token, email, time);

                if (isValid) {
                    const { user } = await import("./user/user.mjs");
                    const foundUser = await user.findOne({ "email.address": email });

                    if (foundUser) {
                        await changePassword(foundUser._id, password);
                        reply.code(200).send("Password Updated");
                    }
                }

                reply.code(401).send();
            } catch (e) {
                console.error(e);
                reply.code(401).send();
            }
        });

        app.post("/api/2fa-register", {}, async (request, reply) => {
            try {
                const user = await getUserFromCookies(request, reply);
                const { token, secret } = request.body;

                const isValid = authenticator.verify({ token, secret });
                if (isValid && user?._id) {
                    await register2FA(user._id, secret);
                    reply.code(200).send("Success");
                }

                reply.code(401).send();
            } catch (e) {
                console.error(e);
                reply.code(401).send();
            }
        });

        app.post("/api/verify-2fa", {}, async (request, reply) => {
            try {
                const { token, email, password } = request.body;
                const { isAuthorized, userId, totp } = await loginUser(email, password);

                const isValid = authenticator.verify({ token, secret: totp });
                if (isValid && userId && isAuthorized) {
                    await logUserIn(userId, request, reply);
                    reply.code(200).send("Success");
                }

                reply.code(401).send();
            } catch (e) {
                console.error(e);
                reply.code(401).send();
            }
        });

        await app.listen(3000);
        console.log("Server listening at port: 3000");
    } catch (e) {
        console.error(e);
    }
}

connectDb().then(() => startApp());