/**
 * API Endpoint: POST /api/sheets/batch-read
 * Reads multiple sheet ranges and returns combined data
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { createSheetsClient } from '@/lib/google-sheets';
import type { ApiResponse, SheetsData } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SheetsData>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.accessToken) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Create Sheets client
    const sheetsId = process.env.NEXT_PUBLIC_SHEETS_ID;
    if (!sheetsId) {
      return res
        .status(500)
        .json({ success: false, error: 'SHEETS_ID not configured' });
    }

    const client = createSheetsClient(session.accessToken as string, sheetsId);

    // Batch read all three sheets
    const data = await client.batchRead([
      { sheet: 'Üretim_Logları', range: 'A:Z' },
      { sheet: 'Saha_Takibi', range: 'A:Z' },
      { sheet: 'Acilamalar', range: 'A:Z' },
    ]);

    // Parse arrays into objects
    const parseSheet = (rows: any[][]): any[] => {
      if (rows.length < 2) return [];
      const headers = rows[0];
      return rows.slice(1).map((row) => {
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || null;
        });
        return obj;
      });
    };

    const sheetsData: SheetsData = {
      productionLogs: parseSheet(data.get('Üretim_Logları') || []),
      fieldTracking: parseSheet(data.get('Saha_Takibi') || []),
      referenceData: parseSheet(data.get('Acilamalar') || []),
    };

    return res.status(200).json({
      success: true,
      data: sheetsData,
    });
  } catch (error: any) {
    console.error('Error in batch-read:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
