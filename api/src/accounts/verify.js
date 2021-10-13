const crypto = require("crypto");
const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env;

async function createVerifyEmailToken(email) {
    try {
        const authString = `${JWT_SIGNATURE}:${email}`;
        return crypto.createHash("sha256").update(authString).digest("hex");
    } catch (e) {
        console.error(e);
    }
}

async function createVerifyEmailLink(email) {
    try {
        const emailToken = await createVerifyEmailToken(email);
        const URIEncodedEmail = encodeURIComponent(email);
        return `https://${ROOT_DOMAIN}/verify/${URIEncodedEmail}/${emailToken}`;
    } catch (e) {
        console.error(e);
    }
}

module.exports = { createVerifyEmailToken, createVerifyEmailLink };