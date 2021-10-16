import jwt from "jsonwebtoken";

const { JWTSignature, ROOT_DOMAIN } = process.env;

export async function logUserOut(request, reply) {
    try {
        const { session } = await import("../sessions/sessions.mjs");

        if (request?.cookies?.refreshToken) {
            const { refreshToken } = request.cookies;
            const { sessionToken } = jwt.verify(refreshToken, JWTSignature);
            await session.deleteOne({ sessionToken });
        }

        reply.clearCookie("refreshToken", {
            path: "/",
            domain: ROOT_DOMAIN,
            httpOnly: true,
            secure: true,
        }).clearCookie("accessToken", {
            path: "/",
            domain: ROOT_DOMAIN,
            httpOnly: true,
            secure: true,
        });
    } catch (e) {
        console.error(e);
    }
}