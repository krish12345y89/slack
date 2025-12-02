import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private static instance: Database;
  private connectionString: string;

  private constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb+srv://krisharora3406:KRISH%4012345y89@cluster0.gxs7ajw.mongodb.net/team-chat';
    console.log('🔧 Database constructor - MONGODB_URI:', this.connectionString ? '✅ Set' : '❌ Not set');
    console.log('🔧 Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(this.connectionString);
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

export default Database;
