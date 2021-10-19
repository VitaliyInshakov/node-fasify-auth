import bcrypt from "bcryptjs";

export async function loginUser(email, password) {
    const { user } = await import("../user/user.mjs");

    const userData = await user.findOne({
        "email.address": email,
    });

    if (userData) {
        const isAuthorized = await bcrypt.compare(password, userData.password);
        return { isAuthorized, userId: userData._id, totp: userData.totp };
    }

    return { isAuthorized: false, userId: null, totp: null };
}
