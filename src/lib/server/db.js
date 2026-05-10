import { MongoClient } from 'mongodb';
import { env } from '$env/dynamic/private';

let client;
let clientPromise;

function getClient() {
    if (!env.DB_URI) {
        throw new Error('DB_URI is not defined in environment variables');
    }
    
    if (clientPromise) return clientPromise;

    client = new MongoClient(env.DB_URI);
    
    if (process.env.NODE_ENV === 'development') {
        if (!global._mongoClientPromise) {
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        clientPromise = client.connect();
    }
    
    return clientPromise;
}

export async function getWorkoutsCollection() {
    const dbClient = await getClient();
    return dbClient.db('focus-fighters').collection('trainings');
}

export async function getTrainersCollection() {
    const dbClient = await getClient();
    return dbClient.db('focus-fighters').collection('trainers');
}

export async function getSessionsCollection() {
    const dbClient = await getClient();
    return dbClient.db('focus-fighters').collection('sessions');
}

export default getClient();
