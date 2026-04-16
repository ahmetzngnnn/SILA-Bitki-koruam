/**
 * ABİS System - Google Sheets API Client
 */

import { sheets_v4, google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleSheetsClient {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor(auth: OAuth2Client, spreadsheetId: string) {
    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = spreadsheetId;
  }

  /**
   * Read a single range from a sheet
   */
  async readRange(sheetName: string, range: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!${range}`,
      });

      return response.data.values || [];
    } catch (error) {
      console.error(`Error reading ${sheetName}!${range}:`, error);
      throw error;
    }
  }

  /**
   * Read multiple ranges at once (batch operation)
   */
  async batchRead(
    requests: Array<{ sheet: string; range: string }>
  ): Promise<Map<string, any[][]>> {
    try {
      const ranges = requests.map((r) => `${r.sheet}!${r.range}`);

      const response = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId: this.spreadsheetId,
        ranges,
      });

      const result = new Map<string, any[][]>();
      response.data.valueRanges?.forEach((vr, index) => {
        const key = requests[index].sheet;
        result.set(key, vr.values || []);
      });

      return result;
    } catch (error) {
      console.error('Error in batchRead:', error);
      throw error;
    }
  }

  /**
   * Write values to a range
   */
  async writeRange(
    sheetName: string,
    range: string,
    values: any[][]
  ): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error(`Error writing to ${sheetName}!${range}:`, error);
      throw error;
    }
  }

  /**
   * Append a row to the end of a sheet
   */
  async appendRow(sheetName: string, values: any[]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });
    } catch (error) {
      console.error(`Error appending to ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Batch update multiple ranges atomically
   */
  async batchUpdate(
    updates: Array<{ range: string; values: any[][] }>
  ): Promise<void> {
    try {
      const requests = updates.map((u) => ({
        range: u.range,
        majorDimension: 'ROWS' as const,
        values: u.values,
      }));

      await this.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          data: requests,
          valueInputOption: 'USER_ENTERED',
        },
      });
    } catch (error) {
      console.error('Error in batchUpdate:', error);
      throw error;
    }
  }

  /**
   * Get sheet metadata
   */
  async getSheetMetadata(): Promise<any> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting sheet metadata:', error);
      throw error;
    }
  }

  /**
   * Find sheet ID by name
   */
  async getSheetIdByName(sheetName: string): Promise<number | null> {
    try {
      const metadata = await this.getSheetMetadata();
      const sheet = metadata.sheets?.find(
        (s: any) => s.properties.title === sheetName
      );
      return sheet?.properties.sheetId ?? null;
    } catch (error) {
      console.error(`Error finding sheet "${sheetName}":`, error);
      return null;
    }
  }

  /**
   * Get header row of a sheet
   */
  async getHeaders(sheetName: string): Promise<string[]> {
    try {
      const values = await this.readRange(sheetName, 'A1:Z1');
      return values[0] || [];
    } catch (error) {
      console.error(`Error getting headers from ${sheetName}:`, error);
      return [];
    }
  }

  /**
   * Find a row by a column value
   */
  async findRowByValue(
    sheetName: string,
    columnIndex: number,
    value: string
  ): Promise<any[] | null> {
    try {
      const values = await this.readRange(sheetName, 'A:Z');
      const row = values.find((r) => r[columnIndex] === value);
      return row || null;
    } catch (error) {
      console.error(`Error finding row in ${sheetName}:`, error);
      return null;
    }
  }
}

/**
 * Get OAuth2 client from NextAuth session
 */
export function createSheetsClient(
  accessToken: string,
  spreadsheetId: string
): GoogleSheetsClient {
  const oauth2Client = new OAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return new GoogleSheetsClient(oauth2Client, spreadsheetId);
}
