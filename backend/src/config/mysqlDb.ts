import mysql from 'mysql2/promise';

export let USE_MYSQL_DB = false;
export let pool: mysql.Pool | null = null;

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'diginotice';

// Table Creation Scripts
const TABLE_DDLS: Record<string, string> = {
  users: `
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`_id\` VARCHAR(64) UNIQUE NOT NULL,
      \`name\` VARCHAR(128) NOT NULL,
      \`email\` VARCHAR(128) UNIQUE NOT NULL,
      \`password\` VARCHAR(255) NOT NULL,
      \`role\` VARCHAR(32) NOT NULL,
      \`department\` VARCHAR(64) DEFAULT NULL,
      \`academicYear\` VARCHAR(32) DEFAULT NULL,
      \`profileImage\` TEXT,
      \`clubs\` JSON DEFAULT NULL,
      \`isVerified\` TINYINT(1) DEFAULT 0,
      \`verificationToken\` VARCHAR(128) DEFAULT NULL,
      \`verificationTokenExpires\` DATETIME DEFAULT NULL,
      \`otpCode\` VARCHAR(16) DEFAULT NULL,
      \`otpExpires\` DATETIME DEFAULT NULL,
      \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
  notices: `
    CREATE TABLE IF NOT EXISTS \`notices\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`_id\` VARCHAR(64) UNIQUE NOT NULL,
      \`title\` VARCHAR(255) NOT NULL,
      \`content\` TEXT NOT NULL,
      \`summary\` TEXT,
      \`category\` VARCHAR(64) NOT NULL,
      \`priority\` VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
      \`department\` VARCHAR(64) DEFAULT NULL,
      \`academicYears\` JSON DEFAULT NULL,
      \`targetGroups\` JSON DEFAULT NULL,
      \`attachments\` JSON DEFAULT NULL,
      \`createdBy\` VARCHAR(64) NOT NULL,
      \`createdByName\` VARCHAR(128) DEFAULT NULL,
      \`createdByDepartment\` VARCHAR(64) DEFAULT NULL,
      \`status\` VARCHAR(32) NOT NULL DEFAULT 'Draft',
      \`publishAt\` DATETIME NOT NULL,
      \`expiresAt\` DATETIME NOT NULL,
      \`views\` INT DEFAULT 0,
      \`acknowledgements\` INT DEFAULT 0,
      \`rejectionReason\` TEXT DEFAULT NULL,
      \`registrationLink\` TEXT DEFAULT NULL,
      \`eventDate\` DATETIME DEFAULT NULL,
      \`venue\` VARCHAR(255) DEFAULT NULL,
      \`targetAudience\` VARCHAR(32) DEFAULT 'STUDENTS',
      \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
  bookmarks: `
    CREATE TABLE IF NOT EXISTS \`bookmarks\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`_id\` VARCHAR(64) UNIQUE NOT NULL,
      \`userId\` VARCHAR(64) NOT NULL,
      \`noticeId\` VARCHAR(64) NOT NULL,
      \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
  notifications: `
    CREATE TABLE IF NOT EXISTS \`notifications\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`_id\` VARCHAR(64) UNIQUE NOT NULL,
      \`userId\` VARCHAR(64) NOT NULL,
      \`noticeId\` VARCHAR(64) NOT NULL,
      \`title\` VARCHAR(255) NOT NULL,
      \`message\` TEXT NOT NULL,
      \`type\` VARCHAR(32) NOT NULL,
      \`isRead\` TINYINT(1) DEFAULT 0,
      \`createdAt\` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
  acknowledgements: `
    CREATE TABLE IF NOT EXISTS \`acknowledgements\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`_id\` VARCHAR(64) UNIQUE NOT NULL,
      \`userId\` VARCHAR(64) NOT NULL,
      \`noticeId\` VARCHAR(64) NOT NULL,
      \`timestamp\` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
  queries: `
    CREATE TABLE IF NOT EXISTS \`queries\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`_id\` VARCHAR(64) UNIQUE NOT NULL,
      \`noticeId\` VARCHAR(64) NOT NULL,
      \`noticeTitle\` VARCHAR(255) DEFAULT NULL,
      \`studentId\` VARCHAR(64) NOT NULL,
      \`studentName\` VARCHAR(128) NOT NULL,
      \`question\` TEXT NOT NULL,
      \`answer\` TEXT DEFAULT NULL,
      \`answeredBy\` VARCHAR(64) DEFAULT NULL,
      \`answeredByName\` VARCHAR(128) DEFAULT NULL,
      \`timestamp\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`answeredAt\` DATETIME DEFAULT NULL,
      \`status\` VARCHAR(32) NOT NULL DEFAULT 'Open'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
  audit_logs: `
    CREATE TABLE IF NOT EXISTS \`audit_logs\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`_id\` VARCHAR(64) UNIQUE NOT NULL,
      \`userId\` VARCHAR(64) NOT NULL,
      \`userName\` VARCHAR(128) NOT NULL,
      \`userRole\` VARCHAR(64) NOT NULL,
      \`action\` TEXT NOT NULL,
      \`noticeId\` VARCHAR(64) DEFAULT NULL,
      \`noticeTitle\` VARCHAR(255) DEFAULT NULL,
      \`timestamp\` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
  departments: `
    CREATE TABLE IF NOT EXISTS \`departments\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`_id\` VARCHAR(64) UNIQUE NOT NULL,
      \`name\` VARCHAR(128) NOT NULL,
      \`code\` VARCHAR(32) UNIQUE NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
  categories: `
    CREATE TABLE IF NOT EXISTS \`categories\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`_id\` VARCHAR(64) UNIQUE NOT NULL,
      \`name\` VARCHAR(64) UNIQUE NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
  calendar_events: `
    CREATE TABLE IF NOT EXISTS \`calendar_events\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`_id\` VARCHAR(64) UNIQUE NOT NULL,
      \`noticeId\` VARCHAR(64) NOT NULL,
      \`title\` VARCHAR(255) NOT NULL,
      \`description\` TEXT NOT NULL,
      \`date\` DATETIME NOT NULL,
      \`startTime\` VARCHAR(32) NOT NULL,
      \`endTime\` VARCHAR(32) NOT NULL,
      \`location\` VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `
};

export const connectMySQL = async (): Promise<boolean> => {
  try {
    console.log(`Connecting to MySQL Server at ${MYSQL_HOST}:${MYSQL_PORT}...`);

    // First connect without database to create target database if needed
    const setupConn = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      connectTimeout: 3000
    });

    await setupConn.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`;`);
    await setupConn.end();

    // Create pool for diginotice database
    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('MySQL Database Connected Successfully.');
    connection.release();

    // Initialize all 10 tables
    for (const [tableName, ddl] of Object.entries(TABLE_DDLS)) {
      await pool.query(ddl);
    }
    console.log('✅ All MySQL tables initialized successfully.');

    USE_MYSQL_DB = true;
    return true;
  } catch (err: any) {
    console.warn(`⚠️ MySQL Connection note: ${err.message}`);
    console.warn('Falling back to default MongoDB / local file JSON Database strategy.');
    USE_MYSQL_DB = false;
    pool = null;
    return false;
  }
};

// Generic MySQL Model class matching Mongoose/MockModel signature
export class MySQLModel<T extends { _id?: string; createdAt?: Date; updatedAt?: Date }> {
  constructor(private tableName: string) {}

  private parseRow(row: any): T {
    if (!row) return row;
    const item: any = { ...row };
    // Parse JSON string fields automatically if object/array
    for (const key in item) {
      if (typeof item[key] === 'string' && (item[key].startsWith('{') || item[key].startsWith('['))) {
        try {
          item[key] = JSON.parse(item[key]);
        } catch (e) {
          // keep as string if parse fails
        }
      }
    }
    return item as T;
  }

  async find(filter?: any): Promise<T[]> {
    if (!pool) return [];
    let sql = `SELECT * FROM \`${this.tableName}\``;
    const values: any[] = [];
    const conditions: string[] = [];

    if (filter && typeof filter === 'object') {
      for (const key in filter) {
        if (filter[key] !== undefined && filter[key] !== null) {
          conditions.push(`\`${key}\` = ?`);
          values.push(typeof filter[key] === 'object' ? JSON.stringify(filter[key]) : filter[key]);
        }
      }
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    const [rows] = await pool.query<any[]>(sql, values);
    return rows.map(r => this.parseRow(r));
  }

  async findOne(filter: any): Promise<T | null> {
    const list = await this.find(filter);
    return list.length > 0 ? list[0] : null;
  }

  async findById(id: string): Promise<T | null> {
    return this.findOne({ _id: id });
  }

  async create(doc: any): Promise<T> {
    if (!pool) throw new Error('MySQL pool not connected');
    const _id = doc._id || Math.random().toString(36).substring(2, 11);
    const now = new Date();
    
    const newDoc: any = {
      ...doc,
      _id,
      createdAt: doc.createdAt || now,
      updatedAt: doc.updatedAt || now
    };

    const keys = Object.keys(newDoc);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.map(k => `\`${k}\``).join(', ');
    const values = keys.map(k => typeof newDoc[k] === 'object' && newDoc[k] !== null ? JSON.stringify(newDoc[k]) : newDoc[k]);

    const sql = `INSERT INTO \`${this.tableName}\` (${columns}) VALUES (${placeholders})`;
    await pool.query(sql, values);

    return newDoc as T;
  }

  async findByIdAndUpdate(id: string, update: any): Promise<T | null> {
    if (!pool) return null;
    const now = new Date();
    const updateDoc = { ...update, updatedAt: now };

    const keys = Object.keys(updateDoc);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = keys.map(k => typeof updateDoc[k] === 'object' && updateDoc[k] !== null ? JSON.stringify(updateDoc[k]) : updateDoc[k]);
    values.push(id);

    const sql = `UPDATE \`${this.tableName}\` SET ${setClauses} WHERE \`_id\` = ?`;
    await pool.query(sql, values);

    return this.findById(id);
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    if (!pool) return null;
    const existing = await this.findById(id);
    if (!existing) return null;

    await pool.query(`DELETE FROM \`${this.tableName}\` WHERE \`_id\` = ?`, [id]);
    return existing;
  }

  async countDocuments(filter?: any): Promise<number> {
    const list = await this.find(filter);
    return list.length;
  }

  async deleteMany(filter?: any): Promise<void> {
    if (!pool) return;
    if (!filter || Object.keys(filter).length === 0) {
      await pool.query(`DELETE FROM \`${this.tableName}\``);
      return;
    }

    const conditions: string[] = [];
    const values: any[] = [];
    for (const key in filter) {
      conditions.push(`\`${key}\` = ?`);
      values.push(filter[key]);
    }
    const sql = `DELETE FROM \`${this.tableName}\` WHERE ` + conditions.join(' AND ');
    await pool.query(sql, values);
  }
}
