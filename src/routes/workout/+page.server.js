import { getWorkoutsCollection } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
    saveSession: async ({ request, locals }) => {
        const data = await request.formData();
        const type = data.get('type');
        const rounds = parseInt(data.get('rounds'));
        const workDuration = parseInt(data.get('workDuration'));
        const restDuration = parseInt(data.get('restDuration'));
        const fighter1 = data.get('fighter1');
        const fighter2 = data.get('fighter2');
        const trainerNotes = data.get('trainerNotes');
        const timestamp = new Date().toISOString();

        if (!locals.user) {
            throw redirect(303, '/login');
        }

        if (!type || !rounds) {
            return fail(400, { message: 'Missing data' });
        }

        try {
            const collection = await getWorkoutsCollection();

            await collection.insertOne({
                trainerId: locals.user._id,
                type,
                rounds,
                workDuration,
                restDuration,
                fighter1,
                fighter2,
                trainerNotes,
                timestamp
            });
        } catch (e) {
            console.error('Database Error:', e);
            return fail(500, { message: 'Could not save to database' });
        }

        throw redirect(303, '/dashboard');
    }
};
