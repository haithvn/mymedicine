const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function backup() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const tables = [
            'users',
            'diseases',
            'medicines',
            'prescriptions',
            'prescription_medicines'
        ];

        const backupData = {};

        for (const table of tables) {
            console.log(`Exporting table: ${table}...`);
            const res = await client.query(`SELECT * FROM ${table}`);
            backupData[table] = res.rows;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        const filePath = path.join(backupDir, `db_backup_${timestamp}.json`);
        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

        console.log(`Backup completed successfully! Saved to: ${filePath}`);
    } catch (err) {
        console.error('Backup failed:', err);
    } finally {
        await client.end();
    }
}

backup();
