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
    try {
        // // Schedule the backup task
        scheduledBackups[repositoryUrl] = schedule(frequencyMap[frequency], async () => {
            const backupCommand = `wget ${repositoryUrl}/archive/master.zip -O backup.zip`;
            exec(backupCommand, async (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error occurred during backup: ${error.message}`);
                    return;
                }

                // prepare the zip file to be uploaded
                const zipFile = fs.readFileSync('backup.zip');

                try {
                    // Add the ZIP file to Infura IPFS
                    const addedFile = await ipfs.add(zipFile)

                    console.log(`Backup created successfully: ${repositoryUrl}`);
                    console.log(`Infura IPFS CID: ${addedFile.cid}`);

                    // Store in db
                    // Create if not exists
                    const backup = await models.Backup.findOne({ repository: repositoryUrl });

                    if (!backup) {
                        console.log('Creating new backup')
                        await models.Backup.create({
                            repository: repositoryUrl,
                            backupFrom: new Date(),
                            lastBackup: new Date(),
                            backupFrequency: frequency,
                            backupType: 'zip',
                            CIDs: [addedFile.cid.toString()],
                        });
                    } else {
                        backup.lastBackup = new Date();
                        backup.CIDs.push(addedFile.cid.toString());
                        await backup.save();
                    }


                } catch (e) {
                    console.error(`Error occurred during Infura IPFS upload: ${e}`);
                    res.sendStatus(500).json({
                        status: 'error',
                        message: 'Error occurred during Infura IPFS upload',
                    });
                }
            });
        });

        res.sendStatus(200).json({
            status: 'success',
            message: 'Backup scheduled successfully',
        });
    } catch (e) {
        res.sendStatus(404).json({
            status: 'error',
            message: 'Frequency not supported',
        });
    }
});

// Endpoint to delete a scheduled backup
app.delete('/schedule/:CID', async (req, res) => {
    // get repo url from CID
    const { CID } = req.params;
    const backup = await models.Backup.findOne({ CIDs: CID });

    console.log(`Deleting backup for ${backup.repository}`);

    const repositoryUrl = backup.repository;

    // Check if the task exists
    if (scheduledBackups[repositoryUrl]) {
        // Stop and remove the scheduled task
        scheduledBackups[repositoryUrl].stop();
        delete scheduledBackups[repositoryUrl];

        // Delete the backup from the database
        await models.Backup.deleteOne({ CIDs: CID });

        res.json({
            status: 'success',
            message: 'Backup deleted successfully',
        });

    } else {
        res.json({
            status: 'error',
            message: 'Backup not found',
        });
    }
});

app.get('/download', (req, res) => {
    // get CID from repo url
    const { repositoryUrl } = req.body;
    const CIDs = models.Backup.findOne({ repository: repositoryUrl }).CIDs;

    // return the CIDs
    res.json({ CIDs });
});

app.get('/backups', async (req, res) => {
    const backups = await models.Backup.find();
    res.json(backups);
});

// Start the server
connectDb().then(async () => {
    console.log('Connected to MongoDB database');
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    })
});
