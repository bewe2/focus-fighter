import { fail, redirect } from '@sveltejs/kit';
import { getTrainersCollection, getSessionsCollection } from '$lib/server/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');
        const action = data.get('action');

        const trainers = await getTrainersCollection();

        // TEST LOGIN LOGIC (Bypass)
        if (!email || action === 'test-login') {
            let testTrainer = await trainers.findOne({ email: 'test@focusfighter.de' });
            
            if (!testTrainer) {
                const hashedPassword = await bcrypt.hash('test1234', 10);
                testTrainer = {
                    _id: 'test-trainer-id',
                    email: 'test@focusfighter.de',
                    password: hashedPassword,
                    name: 'Max'
                };
                await trainers.insertOne(testTrainer);
            }
            
            return await createSession(testTrainer._id, cookies);
        }

        if (action === 'register') {
            const existingTrainer = await trainers.findOne({ email });
            if (existingTrainer) {
                return fail(400, { email, error: 'Trainer already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newTrainer = {
                _id: crypto.randomUUID(),
                email,
                password: hashedPassword,
                name: email.split('@')[0]
            };

            await trainers.insertOne(newTrainer);
            
            // Create session after registration
            return await createSession(newTrainer._id, cookies);
        }

        if (action === 'login') {
            const trainer = await trainers.findOne({ email });
            if (!trainer) {
                return fail(400, { email, error: 'Invalid credentials' });
            }

            const isValid = await bcrypt.compare(password, trainer.password);
            if (!isValid) {
                return fail(400, { email, error: 'Invalid credentials' });
            }

            return await createSession(trainer._id, cookies);
        }
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
        maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    throw redirect(303, '/dashboard');
}
