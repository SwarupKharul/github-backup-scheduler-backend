import express, { json } from 'express';
const app = express();
import { schedule } from 'node-cron';
import fs from 'fs';
import cors from 'cors';
import { exec } from 'child_process';
import { create } from 'ipfs-http-client';
import models, { connectDb } from './models/index.js';
import dotenv from 'dotenv';
dotenv.config();

// Middleware
app.use(json());

app.use(cors());

// Infura IPFS configuration
const infuraProjectId = process.env.INFURA_PROJECT_ID;
const infuraProjectSecret = process.env.INFURA_PROJECT_SECRET;
const infuraEndpoint = `https://${infuraProjectId}:${infuraProjectSecret}@ipfs.infura.io:5001`;
const ipfs = create({ url: infuraEndpoint });

// Store the scheduled backup tasks
const scheduledBackups = {};
// Endpoint to schedule a backup
app.post('/schedule', async (req, res) => {
    const { repositoryUrl, frequency } = req.body;

    // Convert the frequency to a cron expression
    const frequencyMap = {
        'daily': '0 0 * * *',
        'weekly': '0 0 * * 0',
        'monthly': '0 0 1 * *',
        'now': '* * * * *',
    };

    // Create a unique identifier for the backup task
    const taskId = Math.random().toString(36).substring(7);

    // // Schedule the backup task
    // scheduledBackups[taskId] = schedule(frequencyMap[frequency], async () => {
    const backupCommand = `wget ${repositoryUrl}/archive/master.zip -O backup.zip`;
    exec(backupCommand, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error occurred during backup: ${error.message}`);
            return;
        }

        // prepare the zip file to be uploaded
        const zipFile = fs.readFileSync('backup.zip');

        // try {
        // Add the ZIP file to Infura IPFS
        const addedFile = await ipfs.add(zipFile)

        console.log(`Backup created successfully: ${repositoryUrl}`);
        console.log(`Infura IPFS CID: ${addedFile.cid}`);
        // } catch (e) {
        //     console.error(`Error occurred during Infura IPFS upload: ${e}`);
        // }
    });
    // });

    res.json({ taskId });
});

// Endpoint to cancel a scheduled backup
app.delete('/schedule/:taskId', (req, res) => {
    const { taskId } = req.params;

    // Check if the task exists
    if (scheduledBackups[taskId]) {
        // Stop and remove the scheduled task
        scheduledBackups[taskId].stop();
        delete scheduledBackups[taskId];
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.get('/download', (req, res) => {
    const CID = "QmXq77xeWjoAXya62m3mYMCh4P52ofA59wb1rrU7sv5CyU";

    // get the download url of ipfs file from the CID
    const downloadUrl = `https://scheduler.infura-ipfs.io/ipfs/${CID}`;

    // return the download url
    res.json({ downloadUrl });
});

// Start the server
connectDb().then(async () => {
    console.log('Connected to MongoDB database');
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    })
});