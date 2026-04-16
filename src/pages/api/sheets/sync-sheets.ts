/**
 * API Endpoint: POST /api/sheets/sync-sheets
 * Full sync - recalculates GDD values and updates status
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createSheetsClient } from '@/lib/google-sheets';
import type { ApiResponse } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ synced: boolean }>>
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

    // Read production logs
    const data = await client.readRange('Üretim_Logları', 'A:Z');

    if (data.length < 2) {
      return res.status(200).json({ success: true, data: { synced: true } });
    }

    const headers = data[0];
    const gddIndex = headers.indexOf('GDD_Birikmis');
    const statusIndex = headers.indexOf('Status');
    const tempIndex = headers.indexOf('Sicaklik');
    const dateIndex = headers.indexOf('Tarih_Basla');

    if (gddIndex === -1 || statusIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Required columns not found',
      });
    }

    // Calculate GDD values (simplified formula)
    // GDD = sum of (daily_avg_temp - base_temp) for each day
    // For this implementation, we'll use a placeholder calculation
    const updates = data.slice(1).map((row) => {
      const temp = parseFloat(row[tempIndex] || 0);
      const baseTemp = 10; // Entomology base temperature
      const dailyGDD = Math.max(0, temp - baseTemp);

      row[gddIndex] = dailyGDD;

      // Update status based on GDD (simplified)
      if (dailyGDD > 500 && row[statusIndex] === 'Aktif') {
        row[statusIndex] = 'Sevkiyat';
      }

      return row;
    });

    // Write back updated values
    await client.writeRange('Üretim_Logları', 'A2:Z1000', updates);

    return res.status(200).json({
      success: true,
      data: { synced: true },
    });
  } catch (error: any) {
    console.error('Error in sync-sheets:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
