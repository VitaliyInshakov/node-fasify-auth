import crypto from "crypto";

const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env;

function createResetToken(email, expTimestamp) {
    try {
        const authString = `${JWT_SIGNATURE}:${email}:${expTimestamp}`;
        return crypto.createHash("sha256").update(authString).digest("hex");
    } catch (e) {
        console.error(e);
    }
}

function validateExpTimestamp(expTimestamp) {
    const expTime = 24 * 60 * 60 * 1000
    const dateDiff = Number(expTimestamp) - Date.now()
    return dateDiff > 0 && dateDiff < expTime
}

export async function createResetEmailLink(email) {
    try {
        const URIEncodedEmail = encodeURIComponent(email);
        const expTimestamp = Date.now() + 24 * 60 * 60 * 1000;
        const token = createResetToken(email, expTimestamp);
        return `https://${ROOT_DOMAIN}/reset/${URIEncodedEmail}/${expTimestamp}/${token}`;
    } catch (e) {
        console.error(e);
    }
}


export async function createResetLink(email) {
    try {
        const { user } = await import("../user/user.mjs");
        const foundUser = await user.findOne({
            "email.address": email
        });

        if (foundUser)  {
            return await createResetEmailLink(email);
        }
        return "";
    } catch (e) {
        console.error(e);
    }
}

export async function validateResetEmail(token, email, expTimestamp) {
    try {
        const resetToken = createResetToken(email, expTimestamp);
        const isValid = resetToken === token;

        const isTimestampValid = validateExpTimestamp(expTimestamp);
        return isValid && isTimestampValid;
    } catch (e) {
        console.error(e);
        return false;
    }
}