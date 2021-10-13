const { randomBytes } = require("crypto");

async function createSession(userId, connection) {
    try {
        const sessionToken = randomBytes(43).toString("hex");
        const { ip, userAgent } = connection;
        const { session } = await require("../sessions/sessions");

        await session.insertOne({
            sessionToken,
            userId,
            valid: true,
            ip,
            userAgent,
            updatedAt: new Date(),
            createdAt: new Date(),
        });

        return sessionToken;
    } catch (e) {
        throw new Error("Session created failed");
    }
}

module.exports = { createSession };