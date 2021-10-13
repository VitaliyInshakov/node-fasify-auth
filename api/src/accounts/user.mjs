import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { createTokens } from "./tokens.mjs";

const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env;

export async function getUserFromCookies(request, reply) {
    try {
        const { user } = await require("../user/user");
        const { session } = await require("../sessions/sessions.mjs");

        if (request?.cookies?.accessToken) {
            const { accessToken } = request.cookies;
            const decodedAccessToken = jwt.verify(accessToken, JWT_SIGNATURE);
            return user.findOne({
                _id: ObjectId(decodedAccessToken?.userId),
            });
        }

        if (request?.cookies?.refreshToken) {
            const { refreshToken } = request.cookies;
            const { sessionToken } = jwt.verify(refreshToken, JWT_SIGNATURE);
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

export async function refreshTokens(sessionToken, userId, reply) {
    try {
        const { accessToken, refreshToken } = await createTokens(sessionToken, userId);

        const now = new Date();
        const refreshExpires = now.setDate(now.getDate() + 30);
        reply
            .setCookie("refreshToken", refreshToken, {
                path: "/",
                domain: ROOT_DOMAIN,
                httpOnly: true,
                secure: true,
                expires: refreshExpires,
            })
            .setCookie("accessToken", accessToken, {
                path: "/",
                domain: ROOT_DOMAIN,
                httpOnly: true,
                secure: true,
            });
    } catch (e) {
        console.error(e);
    }
}