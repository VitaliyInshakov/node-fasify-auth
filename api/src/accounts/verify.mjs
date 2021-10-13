import crypto from "crypto";
const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env;

export async function createVerifyEmailToken(email) {
    try {
        const authString = `${JWT_SIGNATURE}:${email}`;
        return crypto.createHash("sha256").update(authString).digest("hex");
    } catch (e) {
        console.error(e);
    }
}

export async function createVerifyEmailLink(email) {
    try {
        const emailToken = await createVerifyEmailToken(email);
        const URIEncodedEmail = encodeURIComponent(email);
        return `https://${ROOT_DOMAIN}/verify/${URIEncodedEmail}/${emailToken}`;
    } catch (e) {
        console.error(e);
    }
}