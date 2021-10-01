const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { createTokens } = require("./tokens");

const JWTSignature = process.env.JWT_SIGNATURE;

async function getUserFromCookies(request, reply) {
    try {
        const { user } = await require("../user/user");
        const { session } = await require("../sessions/sessions");

        if (request?.cookies?.accessToken) {
            const { accessToken } = request.cookies;
            const decodedAccessToken = jwt.verify(accessToken, JWTSignature);
            return user.findOne({
                _id: ObjectId(decodedAccessToken?.userId),
            });
        }

        if (request?.cookies?.refreshToken) {
            const { refreshToken } = request.cookies;
            const { sessionToken } = jwt.verify(refreshToken, JWTSignature);
            const currentSession = await session.findOne({ sessionToken });

            if (currentSession.valid) {
                const currentSession = await user.findOne({
                    _id: currentSession.userId,
                });
            }

            await refreshTokens(sessionToken, currentSession._id, reply);
        }
    } catch (e) {
        console.error(e);
    }
}

async function refreshTokens(sessionToken, userId, reply) {
    try {
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
    } catch (e) {
        console.error(e);
    }
}

module.exports = { getUserFromCookies, refreshTokens };