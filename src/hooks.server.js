import { getSessionsCollection, getTrainersCollection } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export async function handle({ event, resolve }) {
    const sessionCookie = event.cookies.get('session');

    if (sessionCookie) {
        const sessions = await getSessionsCollection();
        const session = await sessions.findOne({ _id: sessionCookie });

        if (session) {
            const trainers = await getTrainersCollection();
            const trainer = await trainers.findOne({ _id: session.trainerId });

            if (trainer) {
                // Remove password from local user object for security
                const { password, ...userWithoutPassword } = trainer;
                event.locals.user = userWithoutPassword;
            }
        }
    }

    // Protection logic
    const path = event.url.pathname;
    const isPublicPath = path === '/login' || path.startsWith('/api/public');

    if (!event.locals.user && !isPublicPath) {
        throw redirect(303, '/login');
    }

    // If logged in, don't allow access to login page
    if (event.locals.user && path === '/login') {
        throw redirect(303, '/dashboard');
    }

    return await resolve(event);
}
