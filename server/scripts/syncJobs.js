import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { syncAll } from '../services/jobIngestionService.js';

dotenv.config();

const parseArgs = () => {
  const options = { source: 'all' };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--query=')) {
      options.query = arg.slice('--query='.length);
    } else if (arg.startsWith('--location=')) {
      options.location = arg.slice('--location='.length);
    } else if (arg.startsWith('--source=')) {
      options.source = arg.slice('--source='.length);
    }
  }

  return options;
};

const run = async () => {
  const options = parseArgs();

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    console.log('Starting job sync...', options);
    const stats = await syncAll(options);

    console.log('Sync complete:', JSON.stringify(stats, null, 2));
    await mongoose.disconnect();

    const synced = stats.inserted + stats.updated;
    const allFailed = synced === 0 && stats.errors > 0;
    process.exit(allFailed ? 1 : 0);
  } catch (err) {
    console.error('Sync failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
