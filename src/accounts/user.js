const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const JWTSignature = process.env.JWT_SIGNATURE;

async function getUserFromCookies(request) {
    try {
        const { user } = await require("../user/user");

        if (request?.cookies?.accessToken) {
            const { accessToken } = request.cookies;
            const decodedAccessToken = jwt.verify(accessToken, JWTSignature);
            return user.findOne({
                _id: ObjectId(decodedAccessToken?.userId),
            });
        }
    } catch (e) {
        console.error(e);
    }
}

async function refreshTokens() {
    try {

    } catch (e) {
        console.error(e);
    }
}

module.exports = { getUserFromCookies, refreshTokens };