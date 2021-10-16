import bcrypt from "bcryptjs";

export async function registerUser(email, password) {
    const { user } = await import("../user/user.mjs");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await user.insertOne({
        email: {
            address: email,
            verified: false,
        },
        password: hashedPassword,
    });

    return result.insertedId;
}