import mongoose from 'mongoose';

import backupSchema from './backup.js';

const connectDb = () => {
    return mongoose.connect(process.env.DATABASE_URL);
}

const models = { Backup: backupSchema };

export { connectDb };

export default models;