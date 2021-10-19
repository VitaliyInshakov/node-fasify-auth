import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { createTokens } from "./tokens.mjs";

const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env;

export async function getUserFromCookies(request, reply) {
    try {
        const { user } = await import("../user/user.mjs");
        const { session } = await import("../sessions/sessions.mjs");

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

export async function changePassword(userId, newPassword) {
    try {
        const { user } = await import("../user/user.mjs");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        return user.updateOne({
            _id: userId,
        }, { $set: { password:  hashedPassword } });
    } catch (e) {
        console.error(e);
    }
}

export async function register2FA(userId, secret) {
    try {
        const { user } = await import("../user/user.mjs");

        return user.updateOne({
            _id: userId,
        }, { $set: { totp:  secret } });
    } catch (e) {
        console.error(e);
    }
}