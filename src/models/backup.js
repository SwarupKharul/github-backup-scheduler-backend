import mongoose from 'mongoose';

const backupSchema = new mongoose.Schema({
    repository: {
        type: String,
        required: true
    },
    backupFrom: {
        type: String,
        required: true,
    },
    backupFrequency: {
        type: String,
        required: true
    },
    backupType: {
        type: String,
        required: true
    },
    lastBackup: {
        type: String,
        required: false,
    },
    CIDs: {
        type: Array,
        required: false,
        default: [],
    },
});

export default mongoose.model('Backup', backupSchema);