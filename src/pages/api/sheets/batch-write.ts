/**
 * API Endpoint: POST /api/sheets/batch-write
 * Writes multiple updates to sheets with validation
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createSheetsClient } from '@/lib/google-sheets';
import { validateBatchUpdate } from '@/lib/sheets-schema';
import type { ApiResponse } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ updatedCells: number }>>
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

    // Validate request body
    const validated = validateBatchUpdate(req.body);

    // Create Sheets client
    const sheetsId = process.env.NEXT_PUBLIC_SHEETS_ID;
    if (!sheetsId) {
      return res
        .status(500)
        .json({ success: false, error: 'SHEETS_ID not configured' });
    }

    const client = createSheetsClient(session.accessToken as string, sheetsId);

    // Perform batch update
    await client.batchUpdate(validated.updates);

    // Count updated cells
    const updatedCells = validated.updates.reduce(
      (count, u) => count + u.values.length * u.values[0].length,
      0
    );

    return res.status(200).json({
      success: true,
      data: { updatedCells },
    });
  } catch (error: any) {
    console.error('Error in batch-write:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error: ' + error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
