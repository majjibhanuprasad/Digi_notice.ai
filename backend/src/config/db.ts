import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

export let USE_MOCK_DB = false;

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists for JSON DB fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/diginotice';
  
  try {
    console.log('Connecting to MongoDB...');
    // Set a short timeout so it fails quickly if MongoDB isn't running
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB Connected Successfully.');
    USE_MOCK_DB = false;
  } catch (err: any) {
    console.warn('⚠️ MongoDB connection failed. Falling back to local file-based JSON Database.');
    console.warn(`Reason: ${err.message}`);
    USE_MOCK_DB = true;
  }
};

// Generic Mock Model to mimic Mongoose CRUD
export class MockModel<T extends { _id?: string; createdAt?: Date; updatedAt?: Date }> {
  private filePath: string;

  constructor(private collectionName: string) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private readData(): T[] {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data) || [];
    } catch (e) {
      console.error(`Error reading ${this.collectionName}:`, e);
      return [];
    }
  }

  private writeData(data: T[]) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Error writing ${this.collectionName}:`, e);
    }
  }

  async find(filter?: Partial<T> | ((item: T) => boolean)): Promise<T[]> {
    const list = this.readData();
    if (!filter) return list;
    if (typeof filter === 'function') {
      return list.filter(filter);
    }
    return list.filter((item: any) => {
      for (const key in filter) {
        if (Array.isArray(item[key]) && Array.isArray(filter[key])) {
          // Check intersection
          const arr1 = item[key] as any[];
          const arr2 = filter[key] as any[];
          if (!arr2.some(x => arr1.includes(x))) return false;
          continue;
        }
        if (key === 'email' && typeof item[key] === 'string' && typeof (filter as any)[key] === 'string') {
          if (item[key].toLowerCase().trim() !== (filter as any)[key].toLowerCase().trim()) return false;
          continue;
        }
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  async findOne(filter: Partial<T> | ((item: T) => boolean)): Promise<T | null> {
    const results = await this.find(filter);
    return results.length > 0 ? results[0] : null;
  }

  async findById(id: string): Promise<T | null> {
    return this.findOne({ _id: id } as any);
  }

  async create(doc: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string }): Promise<T> {
    const list = this.readData();
    const now = new Date();
    const newDoc = {
      ...doc,
      _id: doc._id || Math.random().toString(36).substring(2, 11),
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    list.push(newDoc);
    this.writeData(list);
    return newDoc;
  }

  async findByIdAndUpdate(id: string, update: Partial<T>, options?: { new?: boolean }): Promise<T | null> {
    const list = this.readData();
    const index = list.findIndex((item: any) => item._id === id);
    if (index === -1) return null;

    const original = list[index];
    const updated = {
      ...original,
      ...update,
      updatedAt: new Date(),
    } as T;

    list[index] = updated;
    this.writeData(list);
    return updated;
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const list = this.readData();
    const index = list.findIndex((item: any) => item._id === id);
    if (index === -1) return null;

    const deleted = list[index];
    list.splice(index, 1);
    this.writeData(list);
    return deleted;
  }

  async countDocuments(filter?: Partial<T>): Promise<number> {
    const results = await this.find(filter);
    return results.length;
  }

  // Helper to clear table (mainly for tests/seeding)
  async deleteMany(filter?: Partial<T>): Promise<void> {
    if (!filter || Object.keys(filter).length === 0) {
      this.writeData([]);
      return;
    }
    const list = this.readData();
    const filtered = list.filter((item: any) => {
      for (const key in filter) {
        if (item[key] === filter[key]) return false;
      }
      return true;
    });
    this.writeData(filtered);
  }
}
