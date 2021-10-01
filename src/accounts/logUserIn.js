const { createSession } = require("./session");
const { refreshTokens }  = require("./user");

async function logUserIn(userId, request, reply) {
    const connectionInfo =  {
        ip: request.ip,
        userAgent: request.headers["user-agent"],
    };
    const sessionToken = await createSession(userId, connectionInfo);

    await refreshTokens(sessionToken, userId, reply);
}

module.exports = { logUserIn };