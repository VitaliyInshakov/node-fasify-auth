import bcrypt from "bcryptjs";

export async function loginUser(email, password) {
    const { user } = await import("../user/user.mjs");

    const userData = await user.findOne({
        "email.address": email,
    });

    const isAuthorized = await bcrypt.compare(password, userData.password);
    return { isAuthorized, userId: userData._id };
}
