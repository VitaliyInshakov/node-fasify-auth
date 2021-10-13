const jwt = require("jsonwebtoken");

const JWTSignature = process.env.JWT_SIGNATURE;

async function createTokens(sessionToken, userId) {
    try {
        const refreshToken = jwt.sign({
            sessionToken
        }, JWTSignature);

        const accessToken = jwt.sign({
            sessionToken,
            userId,
        }, JWTSignature);

        return { refreshToken, accessToken };
    } catch (e) {
        console.error(e);
    }
}

module.exports = { createTokens };