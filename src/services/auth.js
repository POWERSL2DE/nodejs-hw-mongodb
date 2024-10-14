import createHttpError from "http-errors";
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersCollection } from "../models/user.js";
import { FIFTEEN_MINUTES, ONE_DAY, TEMPLATES_DIR } from "../constants/index.js";
import { SessionsCollection } from "../models/session.js";

import jwt from 'jsonwebtoken';

import { SMTP } from "../constants/index.js";
import { env } from "../utils/env.js";
import { sendEmail } from "../utils/sendMail.js";

import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';


export const registerUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });
    if (user) throw createHttpError(409, 'This email already used');

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    return await UsersCollection.create({
        ...payload,
        password: encryptedPassword,
    });
};


export const loginUser = async (payload) => {
    const user = await UsersCollection.findOne({ email: payload.email });
    if (!user) {
        throw createHttpError(404, 'User is not found');
    }

    const isEqual = await bcrypt.compare(payload.password, user.password);

    if (!isEqual) {
        throw createHttpError(401, 'Unathorized');
    }

    await SessionsCollection.deleteOne({ userId: user._id });

    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return await SessionsCollection.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
    });
};

export const logoutUser = async (sessionId) => {
    await SessionsCollection.deleteOne({ _id: sessionId });

};

const createSession = () => {
    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
    };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
    const session = await SessionsCollection.findOne({
        _id: sessionId,
        refreshToken,
    });

    if (!session) {
        throw createHttpError(401, 'Session is not found');
    }

    const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
    if (isSessionTokenExpired) {
        throw createHttpError(401, 'Session token is expired');
    }

    const newSession = createSession();

    await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

    return await SessionsCollection.create({
        userId: session.userId,
        ...newSession,
    });
};

export const requestResetToken = async (email) => {
    const user = await UsersCollection.findOne({ email });
    if (!user) {
        throw createHttpError(404, 'User is not found');
    }

    const resetToken = jwt.sign(
        {
            sub: user._id,
            email,
        },
        env('JWT_SECRET'),
        {
            expiresIn: '5m',
        }
    );

    const resetPasswordTemplatePath = path.join(
        TEMPLATES_DIR,
        'reset-password-email.html',
    );

    const templateSource = (
        await fs.readFile(resetPasswordTemplatePath)
    ).toString();

    const template = handlebars.compile(templateSource);
    const html = template({
        name: user.name,
        link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
    });

    try {
        await sendEmail({
            from: env(SMTP.SMTP_FROM),
            to: email,
            subject: 'Reset your password',
            html,
        });
    } catch {
        throw createHttpError(500, 'Failed to send the email, please try again or later');
    }
};

export const resetPassword = async (payload) => {
    let entries;

    try {
        entries = jwt.vefiry(payload.token, env('JWT_SECRET'));
    } catch (error) {
        if (error instanceof Error) throw createHttpError(401, 'Token is expired or invalid!');
        throw error;
    }

    const user = await UsersCollection.findOne({
        email: entries.email,
        _id: entries.sub,
    });

    if (!user) {
        throw createHttpError(404, 'User is not found');
    }

    const encryptedPassword = await bcrypt.bash(payload.password, 10);

    await UsersCollection.updateOne(
        { _id: user._id },
        { password: encryptedPassword },
    );
};

