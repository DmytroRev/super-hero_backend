import mongoose from 'mongoose';
import { env } from '../utils/env.js';

async function initMongoConnection() {
  try {
    const user = env('MONGODB_USER');
    const pwd = env('MONGODB_PASSWORD');
    const url = env('MONGODB_URL');
    const db = env('MONGODB_DB');
    const DB_URI = `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster0`;
    await mongoose.connect(DB_URI);
    console.log('Mongo connecting successfully established!');
  } catch (err) {
    console.error(err);
  }
}

export { initMongoConnection };
