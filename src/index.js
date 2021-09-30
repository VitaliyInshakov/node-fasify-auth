require("./env");
const fastify = require("fastify");
const fastifyStatic = require("fastify-static");
const fastifyCookie = require("fastify-cookie");
const path = require("path");
const { connectDb } = require("./db");
const { registerUser } = require("./accounts/register");
const { loginUser } = require("./accounts/login");
const { logUserIn } = require("./accounts/logUserIn");
const { getUserFromCookies } = require("./accounts/user");

const app = fastify();

async function startApp() {
    try {
        app.register(fastifyStatic, {
            root: path.join(__dirname, "public"),
        });

        app.register(fastifyCookie, {
            secret: process.env.COOKIE_SIGNATURE,
        });

        app.post("/api/register", {}, async (request, reply) => {
            try {
                const id = await registerUser(request.body.email, request.body.password);

            } catch (e) {
                console.error(e);
            }
        });

        app.post("/api/login", {}, async (request, reply) => {
            try {
                const { isAuthorized, userId } = await loginUser(request.body.email, request.body.password);

                if (isAuthorized)  {
                    await logUserIn(userId, request, reply);
                    reply.send({ data: "User Logged In" });
                }
            } catch (e) {
                console.error(e);
            }
        });

        app.get("/test", {}, async (request, reply) => {
            try {
                const user = await getUserFromCookies(request);

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