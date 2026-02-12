import { Injectable } from '@angular/core';

/**
 * Service pour la validation et le formatage des formulaires de paiement
 */
@Injectable({
    providedIn: 'root'
})
export class PaymentFormService {

    constructor() { }

    /**
     * Format card number with spaces (XXXX XXXX XXXX XXXX)
     */
    formatCardNumber(text: string): string {
        const cleaned = text.replace(/\s+/g, '');
        const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
        return formatted;
    }

    /**
     * Handle card number input - returns formatted card number
     */
    handleCardNumberChange(text: string | null | undefined): string {
        if (!text) return '';
        const numericOnly = text.replace(/[^0-9]/g, '');
        const truncated = numericOnly.slice(0, 16);
        return this.formatCardNumber(truncated);
    }

    /**
     * Handle expiry date input - returns formatted date (MM/YY)
     */
    handleExpiryDateChange(text: string | null | undefined): string {
        if (!text) return '';
        const numericOnly = text.replace(/[^0-9]/g, '');
        if (numericOnly.length <= 2) {
            return numericOnly;
        } else {
            return `${numericOnly.slice(0, 2)}/${numericOnly.slice(2, 4)}`;
        }
    }

    /**
     * Handle CVV input - returns formatted CVV (max 4 digits)
     */
    handleCvvChange(text: string | null | undefined): string {
        if (!text) return '';
        const numericOnly = text.replace(/[^0-9]/g, '');
        return numericOnly.slice(0, 4);
    }

    /**
     * Validate phone number (Cameroon format: 9 digits)
     */
    validatePhoneNumber(phone: string): boolean {
        const cleanPhone = phone.replace(/\s/g, '').replace(/\+/g, '').replace(/237/g, '');
        return cleanPhone.length === 9 && /^\d+$/.test(cleanPhone);
    }

    /**
     * Validate email format
     */
    validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Format phone number with country prefix
     */
    getFullPhoneNumber(phoneNumber: string, defaultPrefix: string = '+237'): string {
        let cleanNumber = phoneNumber.trim();

        // Remove prefix if user typed it manually
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
     * Validate Orange Money number (Cameroon)
     */
    validateOrangeNumber(number: string): { valid: boolean; error: string } {
        const orangePrefixes = ['69', '66', '67', '68'];

        if (number.length !== 9) {
            return { valid: false, error: 'Le numéro doit contenir exactement 9 chiffres' };
        }

        if (!/^\d+$/.test(number)) {
            return { valid: false, error: 'Le numéro ne doit contenir que des chiffres' };
        }

        const prefix = number.substring(0, 2);
        if (!orangePrefixes.includes(prefix)) {
            return { valid: false, error: 'Numéro Orange invalide. Utilisez 69, 66, 67 ou 68' };
        }

        return { valid: true, error: '' };
    }

    /**
     * Validate MTN Money number (Cameroon)
     */
    validateMTNNumber(number: string): { valid: boolean; error: string } {
        const mtnPrefixes = ['65', '67', '24', '25', '54', '55'];

        if (number.length !== 9) {
            return { valid: false, error: 'Le numéro doit contenir exactement 9 chiffres' };
        }

        if (!/^\d+$/.test(number)) {
            return { valid: false, error: 'Le numéro ne doit contenir que des chiffres' };
        }

        const prefix = number.substring(0, 2);
        if (!mtnPrefixes.includes(prefix)) {
            return { valid: false, error: 'Numéro MTN invalide. Utilisez 65, 67, 24, 25, 54 ou 55' };
        }

        return { valid: true, error: '' };
    }

    /**
     * Validate card number (basic Luhn algorithm)
     */
    validateCardNumber(cardNumber: string): boolean {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleaned)) return false;

        // Luhn algorithm
        let sum = 0;
        let isEven = false;

        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i], 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    /**
     * Validate expiry date (MM/YY format)
     */
    validateExpiryDate(expiryDate: string): boolean {
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;

        const [month, year] = expiryDate.split('/').map(Number);
        if (month < 1 || month > 12) return false;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;

        return true;
    }

    /**
     * Validate CVV (3 or 4 digits)
     */
    validateCVV(cvv: string): boolean {
        return /^\d{3,4}$/.test(cvv);
    }
}
