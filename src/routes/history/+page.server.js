import { getWorkoutsCollection } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    try {
        const collection = await getWorkoutsCollection();

        // Fetch ALL sessions for this trainer sorted by newest first
        const allSessions = await collection
            .find({ trainerId: locals.user._id })
            .sort({ timestamp: -1 })
            .toArray();

        return {
            history: JSON.parse(JSON.stringify(allSessions))
        };
    } catch (e) {
        console.error('History Load Error:', e);
        return {
            history: []
        };
    }
}
