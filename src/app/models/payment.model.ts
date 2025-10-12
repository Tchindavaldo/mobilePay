// Interfaces pour le système de paiement

export interface PaymentRequest {
  numeroOM: string;
  email: string;
  motDePasse?: string;
  typeDePlan: PlanType;
  userId: string; // User ID from storage for payment validation
  amount: number; // Montant du paiement
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  orderId?: string;
  transactionId?: string;
  data?: any;
}

export type PlanType = 'mobile' | 'basic' | 'standard' | 'premium';

export interface PaymentError {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PlanInfo {
  type: PlanType;
  price: number;
  name: string;
  resolution: string;
}
