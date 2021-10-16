import jwt from "jsonwebtoken";

const JWTSignature = process.env.JWT_SIGNATURE;

export async function logUserOut(request, reply) {
    try {
        const { session } = await import("../sessions/sessions.mjs");

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