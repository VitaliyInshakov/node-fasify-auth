import crypto from "crypto";
const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env;

function createVerifyEmailToken(email) {
    try {
        const authString = `${JWT_SIGNATURE}:${email}`;
        return crypto.createHash("sha256").update(authString).digest("hex");
    } catch (e) {
        console.error(e);
    }
}

export async function createVerifyEmailLink(email) {
    try {
        const emailToken = createVerifyEmailToken(email);
        const URIEncodedEmail = encodeURIComponent(email);
        return `https://${ROOT_DOMAIN}/verify/${URIEncodedEmail}/${emailToken}`;
    } catch (e) {
        console.error(e);
    }
}


export async function validateVerifyEmail(token, email) {
    try {
        const emailToken = createVerifyEmailToken(email);
        const isValid = emailToken === token;

        if (isValid) {
            const { user } = await import("../user/user.mjs");
            await user.updateOne({
                "email.address": email
            }, {
                $set: { "email.verified": true },
            });
            return true;
        }

        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
}