import mongoose, { Schema } from 'mongoose';
import { USE_MOCK_DB, MockModel } from '../config/db';
import { USE_MYSQL_DB, MySQLModel } from '../config/mysqlDb';

// Interfaces
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'DEPARTMENT_ADMIN' | 'STUDENT';
  department: string | null; // CSE, ECE, EEE, Mechanical, Civil, or null
  academicYear: string | null; // 1st Year, 2nd Year, 3rd Year, 4th Year, or null
  profileImage: string;
  clubs: string[];
  isVerified?: boolean;
  verificationToken?: string | null;
  verificationTokenExpires?: Date | null;
  otpCode?: string | null;
  otpExpires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotice {
  _id?: string;
  title: string;
  content: string;
  summary: string;
  category: string; // Exams, Placements, Sports, Cultural, Workshops, Events, General, Emergency
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  department: string | null; // CSE, ECE, etc.
  academicYears: string[];
  targetGroups: string[];
  attachments: { type: 'pdf' | 'image'; name: string; url: string }[];
  createdBy: string; // User ID
  createdByName?: string;
  createdByDepartment?: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Scheduled' | 'Published' | 'Expired' | 'Archived';
  publishAt: Date;
  expiresAt: Date;
  views: number;
  acknowledgements: number;
  rejectionReason?: string;
  registrationLink?: string;
  eventDate?: Date;
  venue?: string;
  targetAudience?: 'STUDENTS' | 'FACULTY' | 'SUPER_ADMIN';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBookmark {
  _id?: string;
  userId: string;
  noticeId: string;
  createdAt?: Date;
}

export interface INotification {
  _id?: string;
  userId: string;
  noticeId: string;
  title: string;
  message: string;
  type: 'Critical' | 'High Priority' | 'Normal' | 'Reminder' | 'Event';
  isRead: boolean;
  createdAt?: Date;
}

export interface IAcknowledgement {
  _id?: string;
  userId: string;
  noticeId: string;
  timestamp: Date;
}

export interface IQuery {
  _id?: string;
  noticeId: string;
  noticeTitle?: string;
  studentId: string;
  studentName: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  answeredByName?: string;
  timestamp: Date;
  answeredAt?: Date;
  status: 'Open' | 'Answered' | 'Closed';
}

export interface IAuditLog {
  _id?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  noticeId?: string;
  noticeTitle?: string;
  timestamp: Date;
}

export interface IDepartment {
  _id?: string;
  name: string;
  code: string;
}

export interface ICategory {
  _id?: string;
  name: string;
}

export interface ICalendarEvent {
  _id?: string;
  noticeId: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
}

// Mongoose Schemas
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'STUDENT'] },
  department: { type: String, default: null },
  academicYear: { type: String, default: null },
  profileImage: { type: String, default: '' },
  clubs: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  verificationTokenExpires: { type: Date, default: null },
  otpCode: { type: String, default: null },
  otpExpires: { type: Date, default: null },
}, { timestamps: true });

const NoticeSchema = new Schema<INotice>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, default: '' },
  category: { type: String, required: true },
  priority: { type: String, required: true, enum: ['CRITICAL', 'HIGH', 'NORMAL'] },
  department: { type: String, default: null },
  academicYears: [{ type: String }],
  targetGroups: [{ type: String }],
  attachments: [{
    type: { type: String, enum: ['pdf', 'image'] },
    name: String,
    url: String
  }],
  createdBy: { type: String, required: true },
  createdByName: { type: String },
  createdByDepartment: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Scheduled', 'Published', 'Expired', 'Archived'],
    default: 'Draft'
  },
  publishAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  views: { type: Number, default: 0 },
  acknowledgements: { type: Number, default: 0 },
  rejectionReason: { type: String },
  registrationLink: { type: String },
  eventDate: { type: Date },
  venue: { type: String },
  targetAudience: { type: String, enum: ['STUDENTS', 'FACULTY', 'SUPER_ADMIN'], default: 'STUDENTS' },
}, { timestamps: true });

const BookmarkSchema = new Schema<IBookmark>({
  userId: { type: String, required: true },
  noticeId: { type: String, required: true },
}, { timestamps: true });

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  noticeId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true, enum: ['Critical', 'High Priority', 'Normal', 'Reminder', 'Event'] },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const AcknowledgementSchema = new Schema<IAcknowledgement>({
  userId: { type: String, required: true },
  noticeId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const QuerySchema = new Schema<IQuery>({
  noticeId: { type: String, required: true },
  noticeTitle: { type: String },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String },
  answeredBy: { type: String },
  answeredByName: { type: String },
  timestamp: { type: Date, default: Date.now },
  answeredAt: { type: Date },
  status: { type: String, required: true, enum: ['Open', 'Answered', 'Closed'], default: 'Open' },
});

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  noticeId: { type: String },
  noticeTitle: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const DepartmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
});

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
});

const CalendarEventSchema = new Schema<ICalendarEvent>({
  noticeId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
});

// Database Wrapper Class for unified access
export class DatabaseModel<T extends { _id?: string; createdAt?: Date; updatedAt?: Date }> {
  private mongooseModel: mongoose.Model<any>;
  private mockModel: MockModel<T>;
  private mysqlModel: MySQLModel<T>;

  constructor(private modelName: string, schema: Schema) {
    this.mongooseModel = mongoose.models[modelName] || mongoose.model(modelName, schema);
    this.mockModel = new MockModel<T>(modelName.toLowerCase());
    this.mysqlModel = new MySQLModel<T>(modelName.toLowerCase() === 'auditlog' ? 'audit_logs' : modelName.toLowerCase() === 'calendarevent' ? 'calendar_events' : `${modelName.toLowerCase()}s`);
  }

  async find(filter?: any): Promise<T[]> {
    if (USE_MYSQL_DB) {
      return this.mysqlModel.find(filter);
    } else if (USE_MOCK_DB) {
      return this.mockModel.find(filter);
    } else {
      return this.mongooseModel.find(this.cleanQuery(filter)).lean() as unknown as T[];
    }
  }

  async findOne(filter: any): Promise<T | null> {
    if (USE_MYSQL_DB) {
      return this.mysqlModel.findOne(filter);
    } else if (USE_MOCK_DB) {
      return this.mockModel.findOne(filter);
    } else {
      return this.mongooseModel.findOne(this.cleanQuery(filter)).lean() as unknown as T | null;
    }
  }

  async findById(id: string): Promise<T | null> {
    if (USE_MYSQL_DB) {
      return this.mysqlModel.findById(id);
    } else if (USE_MOCK_DB) {
      return this.mockModel.findById(id);
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        // Fallback for custom string IDs in MongoDB (e.g. from mock seeds)
        return this.mongooseModel.findOne({ _id: id }).lean() as unknown as T | null;
      }
      return this.mongooseModel.findById(id).lean() as unknown as T | null;
    }
  }

  async create(doc: any): Promise<T> {
    if (USE_MYSQL_DB) {
      return this.mysqlModel.create(doc);
    } else if (USE_MOCK_DB) {
      return this.mockModel.create(doc);
    } else {
      const created = await this.mongooseModel.create(doc);
      return created.toObject() as unknown as T;
    }
  }

  async findByIdAndUpdate(id: string, update: any, options?: { new?: boolean }): Promise<T | null> {
    if (USE_MYSQL_DB) {
      return this.mysqlModel.findByIdAndUpdate(id, update);
    } else if (USE_MOCK_DB) {
      return this.mockModel.findByIdAndUpdate(id, update);
    } else {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { _id: id };
      return this.mongooseModel.findOneAndUpdate(query, update, { new: true, ...options }).lean() as unknown as T | null;
    }
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    if (USE_MYSQL_DB) {
      return this.mysqlModel.findByIdAndDelete(id);
    } else if (USE_MOCK_DB) {
      return this.mockModel.findByIdAndDelete(id);
    } else {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { _id: id };
      return this.mongooseModel.findOneAndDelete(query).lean() as unknown as T | null;
    }
  }

  async countDocuments(filter?: any): Promise<number> {
    if (USE_MYSQL_DB) {
      return this.mysqlModel.countDocuments(filter);
    } else if (USE_MOCK_DB) {
      return this.mockModel.countDocuments(filter);
    } else {
      return this.mongooseModel.countDocuments(this.cleanQuery(filter));
    }
  }

  async deleteMany(filter?: any): Promise<void> {
    if (USE_MYSQL_DB) {
      await this.mysqlModel.deleteMany(filter);
    } else if (USE_MOCK_DB) {
      await this.mockModel.deleteMany(filter);
    } else {
      await this.mongooseModel.deleteMany(this.cleanQuery(filter));
    }
  }

  // Clean Mongoose queries to support nested objects/arrays nicely
  private cleanQuery(filter: any) {
    if (!filter) return {};
    const clean: any = {};
    for (const key in filter) {
      if (filter[key] !== undefined) {
        clean[key] = filter[key];
      }
    }
    return clean;
  }
}

// Export wrappers
export const User = new DatabaseModel<IUser>('User', UserSchema);
export const Notice = new DatabaseModel<INotice>('Notice', NoticeSchema);
export const Bookmark = new DatabaseModel<IBookmark>('Bookmark', BookmarkSchema);
export const Notification = new DatabaseModel<INotification>('Notification', NotificationSchema);
export const Acknowledgement = new DatabaseModel<IAcknowledgement>('Acknowledgement', AcknowledgementSchema);
export const Query = new DatabaseModel<IQuery>('Query', QuerySchema);
export const AuditLog = new DatabaseModel<IAuditLog>('AuditLog', AuditLogSchema);
export const Department = new DatabaseModel<IDepartment>('Department', DepartmentSchema);
export const Category = new DatabaseModel<ICategory>('Category', CategorySchema);
export const CalendarEvent = new DatabaseModel<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
