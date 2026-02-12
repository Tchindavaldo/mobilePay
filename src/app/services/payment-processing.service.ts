import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentService } from './payment.service';
import { PaymentRequest, PlanType } from '../models';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Service pour le traitement des paiements et des abonnements
 */
@Injectable({
    providedIn: 'root'
})
export class PaymentProcessingService {

    constructor(
        private paymentService: PaymentService,
        private sanitizer: DomSanitizer
    ) { }

    /**
     * Process Mobile Money payment
     */
    processMobileMoneyPayment(data: {
        userId: string;
        phoneNumber: string;
        netflixEmail: string;
        netflixPassword: string;
        selectedPlan: string;
        totalAmount: number;
        defaultPhonePrefix: string;
    }): Observable<any> {
        const paymentData: PaymentRequest = {
            numeroOM: this.formatPhoneNumber(data.phoneNumber, data.defaultPhonePrefix),
            email: data.netflixEmail.trim(),
            motDePasse: data.netflixPassword,
            typeDePlan: data.selectedPlan as PlanType,
            userId: data.userId,
            amount: data.totalAmount
        };

        console.log('📊 Payment data:', paymentData);

        return this.paymentService.initiateMobileMoneyPayment(paymentData);
    }

    /**
     * Format phone number with country prefix
     */
    private formatPhoneNumber(phoneNumber: string, defaultPrefix: string): string {
        let cleanNumber = phoneNumber.trim();

        if (cleanNumber.startsWith('+237')) {
            cleanNumber = cleanNumber.substring(4);
        } else if (cleanNumber.startsWith('237')) {
            cleanNumber = cleanNumber.substring(3);
        } else if (cleanNumber.startsWith('+')) {
            cleanNumber = cleanNumber.substring(1);
        }

        return `${defaultPrefix}${cleanNumber}`;
    }

    /**
     * Get Netflix credentials (create or retrieve)
     */
    getNetflixCredentials(userId: string, lastName: string, firstName: string): Observable<any> {
        return this.paymentService.getNetflixCredentials(userId, lastName, firstName);
    }

    /**
     * Initiate subscription process
     */
    initiateSubscription(data: {
        transactionId: string;
        planActivationId: string;
        selectedPlan: string;
        netflixEmail: string;
        netflixPassword: string;
        userId: string;
        totalAmount: number;
        phoneNumber: string;
        defaultPhonePrefix: string;
    }): Observable<any> {
        const subscriptionData = {
            typeDePlan: data.selectedPlan,
            email: data.netflixEmail,
            motDePasse: data.netflixPassword,
            planActivationId: data.planActivationId,
            userId: data.userId,
            transactionId: data.transactionId,
            amount: data.totalAmount,
            numeroOM: this.formatPhoneNumber(data.phoneNumber, data.defaultPhonePrefix),
            useOrchestration: false
        };

        return this.paymentService.initSubscription(subscriptionData);
    }

    /**
     * Cancel payment verification
     */
    cancelPaymentVerification(transactionId: string): Observable<any> {
        return this.paymentService.cancelPaymentVerification(transactionId);
    }

    /**
     * Process card payment
     */
    processCardPayment(data: {
        cardNumber: string;
        expiryDate: string;
        cvv: string;
        cardName: string;
    }): Promise<{ success: boolean; orderNumber: string }> {
        return new Promise((resolve) => {
            // Simulate card processing
            setTimeout(() => {
                const orderNumber = `YU${Math.floor(100000 + Math.random() * 900000)}`;
                resolve({ success: true, orderNumber });
            }, 1500);
        });
    }

    /**
     * Validate payment data before processing
     */
    validatePaymentData(data: {
        phoneNumber?: string;
        netflixEmail: string;
        netflixPassword: string;
        paymentMethod: string;
    }): { valid: boolean; error?: string } {
        // Validate email
        if (!data.netflixEmail || !this.isValidEmail(data.netflixEmail)) {
            return { valid: false, error: 'Veuillez entrer un email Netflix valide' };
        }

        // Validate password
        if (!data.netflixPassword) {
            return { valid: false, error: 'Veuillez entrer votre mot de passe Netflix' };
        }

        // Validate phone for mobile money
        if ((data.paymentMethod === 'orangemoney' || data.paymentMethod === 'mtnmoney') && data.phoneNumber) {
            const cleanPhone = data.phoneNumber.replace(/\s/g, '').replace(/\+/g, '').replace(/237/g, '');
            if (cleanPhone.length < 9) {
                return { valid: false, error: 'Veuillez entrer un numéro de téléphone valide (9 chiffres)' };
            }
        }

        return { valid: true };
    }

    /**
     * Simple email validation
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
