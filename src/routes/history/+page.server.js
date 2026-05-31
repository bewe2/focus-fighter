import { getWorkoutsCollection } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export async function load({ locals }) {
    if (!locals.user) throw redirect(303, '/login');

    try {
        const collection = await getWorkoutsCollection();
        const allSessions = await collection
            .find({ trainerId: locals.user._id })
            .sort({ timestamp: -1 })
            .toArray();

        return { history: JSON.parse(JSON.stringify(allSessions)) };
    } catch (e) {
        console.error('History Load Error:', e);
        return { history: [] };
    }
}

export const actions = {
    delete: async ({ request, locals }) => {
        if (!locals.user) throw redirect(303, '/login');

        const data = await request.formData();
        const id = data.get('id')?.toString();
        if (!id) return fail(400, { error: 'Missing id' });

        try {
            const collection = await getWorkoutsCollection();
            await collection.deleteOne({ _id: new ObjectId(id), trainerId: locals.user._id });
        } catch {
            // _id might be a plain string (older entries without ObjectId)
            try {
                const collection = await getWorkoutsCollection();
                await collection.deleteOne({ _id: id, trainerId: locals.user._id });
            } catch (e) {
                return fail(500, { error: 'Could not delete' });
            }
        }
    }
};
