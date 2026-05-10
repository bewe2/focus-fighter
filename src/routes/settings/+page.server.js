import { redirect } from '@sveltejs/kit';
import { getSessionsCollection } from '$lib/server/db';

export const actions = {
    logout: async ({ cookies }) => {
        const sessionId = cookies.get('session');
        if (sessionId) {
            const sessions = await getSessionsCollection();
            await sessions.deleteOne({ _id: sessionId });
            cookies.delete('session', { path: '/' });
        }
        throw redirect(303, '/login');
    }
};
