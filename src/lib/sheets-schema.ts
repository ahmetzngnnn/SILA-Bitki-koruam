/**
 * ABİS System - Zod Schema Validation
 */

import { z } from 'zod';
import type {
  ProductionLog,
  FieldTracking,
  ReferenceData,
  BiologicalStage,
  Status,
} from './types';

const BiologicalStageEnum = z.enum(['Yumurta', 'Larva', 'Pupa', 'Ergin']);
const StatusEnum = z.enum(['Aktif', 'Sevkiyat', 'Tamamlandı']);

/**
 * Production Log Validator
 */
export const ProductionLogSchema = z.object({
  Parti_ID: z.string().min(1, 'Parti_ID gereklidir'),
  Biyolojik_Evre: BiologicalStageEnum,
  Sicaklik: z.number().min(-10).max(50, 'Sıcaklık -10 ile 50°C arasında olmalı'),
  Nem: z.number().min(0).max(100, 'Nem %0 ile %100 arasında olmalı'),
  GDD_Birikmis: z.number().nonnegative(),
  Tarih_Basla: z.string(), // ISO date
  Tarih_Biten: z.string().optional(),
  Status: StatusEnum,
  Takvim: z.string().optional(),
  Notlar: z.string().optional(),
});

/**
 * Field Tracking Validator
 */
export const FieldTrackingSchema = z.object({
  Parti_ID: z.string().min(1),
  Ciftci_Ad: z.string().min(1),
  Sevkiyat_Tarihi: z.string().optional(),
  Sevkiyat_Miktari: z.number().positive().optional(),
  Verim_Puani: z.number().min(1).max(10).optional(),
  Geri_Bildirim: z.string().optional(),
  Hatirlayici_Gonderildi: z.boolean().optional(),
  Son_Guncelleme: z.string(),
});

/**
 * Reference Data Validator
 */
export const ReferenceDataSchema = z.object({
  Biyolojik_Evre: BiologicalStageEnum,
  Optimal_Sicaklik_Min: z.number(),
  Optimal_Sicaklik_Max: z.number(),
  Optimal_Nem_Min: z.number().min(0).max(100),
  Optimal_Nem_Max: z.number().min(0).max(100),
  Notlar: z.string().optional(),
});

/**
 * Validation Helpers
 */
export function validateProductionLog(data: unknown): ProductionLog {
  return ProductionLogSchema.parse(data);
}

export function validateFieldTracking(data: unknown): FieldTracking {
  return FieldTrackingSchema.parse(data);
}

export function validateReferenceData(data: unknown): ReferenceData {
  return ReferenceDataSchema.parse(data);
}

/**
 * Batch Update Data Validator
 */
export const BatchUpdateSchema = z.object({
  updates: z.array(
    z.object({
      sheet: z.string(),
      range: z.string(),
      values: z.array(z.array(z.any())),
    })
  ),
});

export function validateBatchUpdate(data: unknown) {
  return BatchUpdateSchema.parse(data);
}
