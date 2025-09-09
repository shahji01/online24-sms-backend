import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { log } from 'node:console';
import { DataSource } from 'typeorm';
import * as XLSX from "xlsx";

@Injectable()
export class DatabaseService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * List all tables with their row counts.
   */
  // listTables: fixed aliasing and safer mapping
  async listTables(): Promise<{ table: string; count: number }[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      // get current database name if needed (not strictly necessary here)
      // const dbNameResult: any = await queryRunner.query('SELECT DATABASE() AS db');
      // const dbName = dbNameResult[0].db;

      const tables: any[] = await queryRunner.query(
        `
        SELECT TABLE_NAME, TABLE_ROWS
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_TYPE = 'BASE TABLE'
        `
      );

      return tables.map((t) => ({
        table: t.TABLE_NAME,
        count: Number(t.TABLE_ROWS) || 0,
      }));
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Truncate the given tables. Only allow whitelisted/valid tables to prevent SQL injection.
   */
  async truncateTables(tables: string[]): Promise<void> {
    if (!tables || tables.length === 0) {
      throw new BadRequestException('No tables specified');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Optional: validate each table exists to avoid injection
      const validTablesRaw: any[] = await queryRunner.query(
        `
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_TYPE = 'BASE TABLE'
          AND TABLE_NAME IN (?)
        `,
        [tables]
      );
      const validTableNames = validTablesRaw.map((r) => r.TABLE_NAME || r.TABLE_NAME?.toString()).filter(Boolean);
      if (validTableNames.length === 0) {
        throw new BadRequestException('No valid tables to truncate');
      }

      for (const tbl of validTableNames) {
        // Use parametrized identifier safely by escaping
        await queryRunner.query(`TRUNCATE TABLE \`${tbl}\``);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to truncate tables');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Fetch all records from a given table. You could add pagination, filtering here.
   */
  async getTableRecords(tableName: string): Promise<any[]> {
    if (!tableName) {
      throw new BadRequestException('Table name required');
    }

    // Basic safety: ensure table exists
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();

      const exists: any[] = await queryRunner.query(
        `
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND TABLE_TYPE = 'BASE TABLE'
        `,
        [tableName]
      );
      if (exists.length === 0) {
        throw new BadRequestException('Table not found');
      }

      // Fetch all rows (careful with very large tables; you might want to limit)
      const rows = await queryRunner.query(`SELECT * FROM \`${tableName}\``);
      return rows;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete records from a table either by list of primary IDs or full record matches.
   * For `records` mode, does a naive deletion using all fields as criteria (AND).
   */
  async deleteRecords(tableName: string, payload: { ids?: string[]; records?: any[] }): Promise<void> {
    if (!tableName) {
      throw new BadRequestException('Table name required');
    }
    if ((!payload.ids || payload.ids.length === 0) && (!payload.records || payload.records.length === 0)) {
      throw new BadRequestException('No records specified to delete');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Validate table exists
      const exists: any[] = await queryRunner.query(
        `
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND TABLE_TYPE = 'BASE TABLE'
        `,
        [tableName]
      );
      if (exists.length === 0) {
        throw new BadRequestException('Table not found');
      }

      if (payload.ids && payload.ids.length > 0) {
        // Assume primary key column is 'id'. If not, this should be adapted per-table or introspected.
        const placeholders = payload.ids.map(() => '?').join(',');
        await queryRunner.query(
          `DELETE FROM \`${tableName}\` WHERE id IN (${placeholders})`,
          payload.ids
        );
      } else if (payload.records && payload.records.length > 0) {
        // Delete each record by matching all its fields (danger: ambiguous if missing primary key)
        for (const rec of payload.records) {
          const keys = Object.keys(rec);
          if (keys.length === 0) continue;
          const whereClauses = keys.map((k) => `\`${k}\` = ?`).join(' AND ');
          const values = keys.map((k) => rec[k]);
          await queryRunner.query(
            `DELETE FROM \`${tableName}\` WHERE ${whereClauses} LIMIT 1`,
            values
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to delete records');
    } finally {
      await queryRunner.release();
    }
  }

  async updateRecord(tableName: string, record: Record<string, any>) {
    if (!record.id) {
      throw new BadRequestException("Record must contain an 'id' field");
    }

    const { id, ...fields } = record;
    if (Object.keys(fields).length === 0) {
      throw new BadRequestException("No fields to update");
    }

    const setClause = Object.keys(fields)
      .map((key) => `\`${key}\` = ?`)
      .join(", ");

    const values = Object.values(fields);

    const query = `UPDATE \`${tableName}\` SET ${setClause} WHERE id = ?`;

    try {
      await this.dataSource.query(query, [...values, id]);

      // Re-fetch updated record (since MySQL doesn’t support RETURNING *)
      const [updated] = await this.dataSource.query(
        `SELECT * FROM \`${tableName}\` WHERE id = ?`,
        [id]
      );

      return { success: true, record: updated };
    } catch (err) {
      console.error("Update failed:", err);
      throw new BadRequestException("Failed to update record");
    }
  }

  async deleteRecord(tableName: string, record: Record<string, any>) {
    try {

      if (!record.id) {
        throw new BadRequestException("Record must contain an 'id' field");
      }

      const query = `DELETE FROM \`${tableName}\` WHERE id = ?`;
      await this.dataSource.query(query, [record.id]);
      return { success: true, message: `Record with ID ${record.id} deleted from ${tableName}` };
    } catch (err) {
      throw new BadRequestException(`Error deleting record: ${err.message}`);
    }
  }

  async importTableData(tableName: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    let jsonData: any[];
    if (file.originalname.endsWith(".xlsx")) {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (file.originalname.endsWith(".csv")) {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        raw: false,
      });
    } else {
      throw new BadRequestException("Unsupported file format");
    }

    if (jsonData.length === 0) {
      throw new BadRequestException("No data found in file");
    }

    const keys = Object.keys(jsonData[0]);
    const placeholders = keys.map(() => "?").join(",");

    for (const row of jsonData) {
      const values = keys.map((k) => row[k]);
      await this.dataSource.query(
        `INSERT INTO ${tableName} (${keys.join(",")}) VALUES (${placeholders})`,
        values
      );
    }

    return { success: true, message: `Imported ${jsonData.length} records` };
  }
}
