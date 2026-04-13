export type PlasticType = "PET" | "HDPE" | "PVC" | "LDPE" | "PP" | "PS" | "OTHER"
export type UserRole = "user" | "agent" | "admin"
export type PickupStatus = "requested" | "assigned" | "in_transit" | "completed" | "cancelled"
export type WasteLogStatus = "pending" | "pickup_requested" | "collected" | "processed"
export type TransactionType = "earned" | "redeemed" | "bonus"
export type ConfidenceLevel = "High" | "Medium" | "Low"

export interface VasudhUser {
  uid: string
  name: string
  phone: string
  email?: string
  photoURL?: string
  city: string
  area: string
  role: UserRole
  totalKgRecycled: number
  totalCredits: number
  createdAt: Date
  fcmToken?: string
}

export interface WasteLog {
  logId: string
  userId: string
  plasticType: PlasticType
  weightKg: number
  imageUrl: string
  geminiResult: GeminiDetectionResult
  creditsEarned: number
  qrCodeId: string
  qrCodeData: string
  status: WasteLogStatus
  pickupId?: string
  impactData: ImpactData
  createdAt: Date
}

export interface GeminiDetectionResult {
  type: PlasticType
  confidence: ConfidenceLevel
  recyclable: boolean
  reason: string
  rawResponse: string
}

export interface ImpactData {
  co2SavedKg: number
  bottlesEquivalent: number
  energySavedKwh: number
}

export interface Pickup {
  pickupId: string
  userId: string
  agentId?: string
  wasteLogIds: string[]
  totalWeightKg: number
  totalCredits: number
  location: PickupLocation
  status: PickupStatus
  scheduledAt?: Date
  completedAt?: Date
  qrVerified: boolean
  createdAt: Date
}

export interface PickupLocation {
  address: string
  lat: number
  lng: number
}

export interface CreditTransaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  pickupId?: string
  createdAt: Date
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}
