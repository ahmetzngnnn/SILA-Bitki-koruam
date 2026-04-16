/**
 * ABİS System - Core Type Definitions
 */

export type BiologicalStage = 'Yumurta' | 'Larva' | 'Pupa' | 'Ergin';
export type Status = 'Aktif' | 'Sevkiyat' | 'Tamamlandı';

/**
 * Üretim_Logları (Production Logs) Row
 */
export interface ProductionLog {
  Parti_ID: string;
  Biyolojik_Evre: BiologicalStage;
  Sicaklik: number;
  Nem: number;
  GDD_Birikmis: number;
  Tarih_Basla: string; // ISO date
  Tarih_Biten?: string; // ISO date
  Status: Status;
  Takvim?: string; // Automated suggestions
  Notlar?: string;
}

/**
 * Saha_Takibi (Field Tracking) Row
 */
export interface FieldTracking {
  Parti_ID: string;
  Ciftci_Ad: string;
  Sevkiyat_Tarihi?: string; // ISO date
  Sevkiyat_Miktari?: number; // kg
  Verim_Puani?: number; // 1-10
  Geri_Bildirim?: string;
  Hatirlayici_Gonderildi?: boolean;
  Son_Guncelleme: string; // ISO date
}

/**
 * Acilamalar (Reference Data) Row
 */
export interface ReferenceData {
  Biyolojik_Evre: BiologicalStage;
  Optimal_Sicaklik_Min: number;
  Optimal_Sicaklik_Max: number;
  Optimal_Nem_Min: number;
  Optimal_Nem_Max: number;
  Notlar?: string;
}

/**
 * Sheet Data Collections
 */
export interface SheetsData {
  productionLogs: ProductionLog[];
  fieldTracking: FieldTracking[];
  referenceData: ReferenceData[];
}

/**
 * API Request/Response Types
 */
export interface BatchReadRequest {
  sheets: Array<'Üretim_Logları' | 'Saha_Takibi' | 'Acilamalar'>;
}

export interface BatchWriteRequest {
  updates: Array<{
    sheet: string;
    range: string;
    values: any[][];
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
