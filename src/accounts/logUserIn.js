const { createSession } = require("./session");
const { createTokens }  = require("./tokens");

async function logUserIn(userId, request, reply) {
    const connectionInfo =  {
        ip: request.ip,
        userAgent: request.headers["user-agent"],
    };
    const sessionToken = await createSession(userId, connectionInfo);

    const { accessToken, refreshToken } = await createTokens(sessionToken, userId);

    const now = new Date();
    const refreshExpires = now.setDate(now.getDate() + 30);
    reply
        .setCookie("refreshToken", refreshToken, {
            path: "/",
            domain: "localhost",
            httpOnly: true,
            expires: refreshExpires,
        }).setCookie("accessToken", accessToken, {
            path: "/",
            domain: "localhost",
            httpOnly: true,
        });
}

module.exports = { logUserIn };