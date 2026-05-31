import { fail, redirect } from '@sveltejs/kit';
import { getTrainersCollection, getSessionsCollection } from '$lib/server/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const action = data.get('action');
        const email = data.get('email')?.toString().trim().toLowerCase();
        const password = data.get('password')?.toString();

        if (action === 'register') {
            const name = data.get('name')?.toString().trim();
            const confirmPassword = data.get('confirmPassword')?.toString();

            if (!name || !email || !password || !confirmPassword) {
                return fail(400, { error: 'missing_fields', email, name, mode: 'register' });
            }

            if (password.length < 8) {
                return fail(400, { error: 'password_too_short', email, name, mode: 'register' });
            }

            if (password !== confirmPassword) {
                return fail(400, { error: 'passwords_mismatch', email, name, mode: 'register' });
            }

            const trainers = await getTrainersCollection();
            const existing = await trainers.findOne({ email });
            if (existing) {
                return fail(400, { error: 'email_taken', email, name, mode: 'register' });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const newTrainer = {
                _id: crypto.randomUUID(),
                email,
                password: hashedPassword,
                name,
                createdAt: new Date()
            };

            await trainers.insertOne(newTrainer);
            return await createSession(newTrainer._id, cookies);
        }

        if (action === 'login') {
            if (!email || !password) {
                return fail(400, { error: 'missing_fields', email, mode: 'login' });
            }

            const trainers = await getTrainersCollection();
            const trainer = await trainers.findOne({ email });

            if (!trainer) {
                return fail(400, { error: 'invalid_credentials', email, mode: 'login' });
            }

            const isValid = await bcrypt.compare(password, trainer.password);
            if (!isValid) {
                return fail(400, { error: 'invalid_credentials', email, mode: 'login' });
            }

            return await createSession(trainer._id, cookies);
        }

        return fail(400, { error: 'missing_fields' });
    }
};

async function createSession(trainerId, cookies) {
    const sessions = await getSessionsCollection();
    const sessionId = crypto.randomUUID();

    await sessions.insertOne({
        _id: sessionId,
        trainerId,
        createdAt: new Date()
    });

    cookies.set('session', sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7
    });

    throw redirect(303, '/dashboard');
}
