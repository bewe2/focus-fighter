// Cleaned version
import { getWorkoutsCollection } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    try {
        const collection = await getWorkoutsCollection();

        // Fetch last 3 sessions for this trainer
        const lastSessions = await collection
            .find({ trainerId: locals.user._id })
            .sort({ timestamp: -1 })
            .limit(3)
            .toArray();

        // Calculate Weekly Stats for this trainer
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklySessions = await collection
            .find({
                trainerId: locals.user._id,
                timestamp: { $gte: startOfWeek.toISOString() }
            })
            .toArray();

        const allSessions = await collection
            .find({ trainerId: locals.user._id })
            .toArray();

        const totalMinutes = allSessions.reduce((acc, sess) => {
            const rounds = sess.rounds || 0;
            const work = sess.workDuration || sess.workTime || 0;
            const rest = sess.restDuration || sess.restTime || 0;
            return acc + (rounds * (work + rest)) / 60;
        }, 0);

        return {
            lastSessions: JSON.parse(JSON.stringify(lastSessions)),
            stats: {
                weeklyCount: weeklySessions.length,
                totalMinutes: Math.round(totalMinutes),
                goalCount: 5
            },
            trainerName: locals.user.name
        };
    } catch (e) {
        console.error('Dashboard Load Error:', e);
        return {
            lastSessions: [],
            stats: { weeklyCount: 0, totalMinutes: 0, goalCount: 5 }
        };
    }
}
