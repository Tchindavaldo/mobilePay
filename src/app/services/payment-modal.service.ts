import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PaymentService } from './payment.service';
import { Subscription } from 'rxjs';

/**
 * Service pour la gestion du modal de paiement et de l'annulation
 */
@Injectable({
    providedIn: 'root'
})
export class PaymentModalService {
    // Modal state
    showPaymentModal: boolean = false;
    paymentUrl: SafeResourceUrl | null = null;
    paymentFrameLoaded: boolean = false;
    isCancelling: boolean = false;
    isInitializing: boolean = false; // Add initialization state
    private initStartTime: number = 0; // Track when initialization started
    verificationStep: number = 0; // 0 = not started, 1 = verifying, 2 = confirmed

    // Transaction tracking
    private currentTransactionId: string = '';
    private subscriptionRequest?: Subscription;

    constructor(
        private sanitizer: DomSanitizer,
        private paymentService: PaymentService
    ) { }

    /**
     * Start payment initialization (open modal with loading state)
     */
    startInitializing(): void {
        this.reset(); // Clear previous state
        this.initStartTime = Date.now(); // Record start time
        this.isInitializing = true;
        this.showPaymentModal = true;
    }

    /**
     * Open payment modal with URL (finish initialization)
     */
    openModal(paymentLink: string, transactionId: string): void {
        // Temps fixe d'affichage de l'overlay noir (en millisecondes)
        // Même si le site charge plus vite, l'overlay restera visible pendant cette durée.
        const DISPLAY_TIME = 6000;

        this.paymentFrameLoaded = false;
        this.currentTransactionId = transactionId;
        this.paymentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(paymentLink);
        this.showPaymentModal = true;

        // On garde l'état "initializing" vrai pendant exactement DISPLAY_TIME
        setTimeout(() => {
            this.isInitializing = false;
        }, DISPLAY_TIME);
    }

    /**
     * Close payment modal
     */
    closeModal(): void {
        // If payment is already validated, just close
        if (this.verificationStep === 2) {
            this.showPaymentModal = false;
            return;
        }

        // Otherwise, cancel the payment process
        this.cancelPayment();
    }

    /**
     * Handle payment frame load event
     */
    onFrameLoad(): void {
        console.log('✅ Payment frame loaded');
        this.paymentFrameLoaded = true;
    }

    /**
     * Set subscription request (for cancellation)
     */
    setSubscriptionRequest(subscription: Subscription): void {
        this.subscriptionRequest = subscription;
    }

    /**
     * Cancel payment process
     */
    cancelPayment(): Promise<void> {
        return new Promise((resolve) => {
            this.isCancelling = true;

            // Cancel ongoing subscription request
            if (this.subscriptionRequest) {
                this.subscriptionRequest.unsubscribe();
                this.subscriptionRequest = undefined;
            }

            // Call backend to cancel verification
            if (this.currentTransactionId) {
                const startTime = Date.now();
                const minDisplayTime = 2000; // 2 seconds minimum

                this.paymentService.cancelPaymentVerification(this.currentTransactionId).subscribe({
                    next: (response) => {
                        console.log('✅ Annulation confirmée:', response);

                        // Ensure minimum display time
                        const elapsed = Date.now() - startTime;
                        const remaining = Math.max(0, minDisplayTime - elapsed);

                        setTimeout(() => {
                            this.finalizeCancellation();
                            resolve();
                        }, remaining);
                    },
                    error: (error) => {
                        console.error('❌ Erreur lors de l\'annulation:', error);

                        // Still finalize even on error
                        const elapsed = Date.now() - startTime;
                        const remaining = Math.max(0, minDisplayTime - elapsed);

                        setTimeout(() => {
                            this.finalizeCancellation();
                            resolve();
                        }, remaining);
                    }
                });
            } else {
                // No transaction ID, just finalize
                this.finalizeCancellation();
                resolve();
            }
        });
    }

    /**
     * Finalize cancellation and reset state
     */
    private finalizeCancellation(): void {
        this.isCancelling = false;
        this.showPaymentModal = false;
        this.paymentUrl = null;
        this.paymentFrameLoaded = false;
        this.currentTransactionId = '';
        this.verificationStep = 0;
    }

    /**
     * Set verification step
     */
    setVerificationStep(step: number): void {
        this.verificationStep = step;
    }

    /**
     * Get current transaction ID
     */
    getCurrentTransactionId(): string {
        return this.currentTransactionId;
    }

    /**
     * Check if modal can be dismissed
     */
    canDismiss(role?: string): boolean {
        // Allow dismissal if payment is confirmed or if it's a programmatic close
        if (this.verificationStep === 2 || !role) {
            return true;
        }

        // For backdrop/gesture, trigger cancellation but don't dismiss immediately
        if ((role === 'backdrop' || role === 'gesture') && !this.isCancelling) {
            this.closeModal();
            return false;
        }

        return true;
    }

    /**
     * Reset all state
     */
    reset(): void {
        this.showPaymentModal = false;
        this.paymentUrl = null;
        this.paymentFrameLoaded = false;
        this.isCancelling = false;
        this.verificationStep = 0;
        this.currentTransactionId = '';

        if (this.subscriptionRequest) {
            this.subscriptionRequest.unsubscribe();
            this.subscriptionRequest = undefined;
        }
    }
}
