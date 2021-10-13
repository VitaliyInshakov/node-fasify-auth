const jwt = require("jsonwebtoken");

const JWTSignature = process.env.JWT_SIGNATURE;

async  function logUserOut(request, reply) {
    try {
        const { session } = await require("../sessions/sessions");

        if (request?.cookies?.refreshToken) {
            const { refreshToken } = request.cookies;
            const { sessionToken } = jwt.verify(refreshToken, JWTSignature);
            await session.deleteOne({ sessionToken });
        }

        reply.clearCookie("refreshToken").clearCookie("accessToken");
    } catch (e) {
        console.error(e);
    }
}

module.exports = { logUserOut };
