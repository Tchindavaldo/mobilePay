import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

export type PlanKey = 'mobile' | 'basic' | 'standard' | 'premium';

export interface NetflixPlan {
    id: string;
    name: string;
    title: string;
    summary: string;
    price: number;
    currency: string;
    quality: string;
    resolution: string;
    support: string;
    simultaneous: number;
    downloads: number;
    active: boolean;
}

/**
 * Service pour la gestion des plans Netflix et de la navigation
 */
@Injectable({
    providedIn: 'root'
})
export class PlanManagementService {
    private selectedPlanId: string = 'premium';
    private currentPage: number = 1;
    private activeStep: number = 1;

    private plansSubject = new BehaviorSubject<NetflixPlan[]>([]);
    public plans$ = this.plansSubject.asObservable();

    constructor(private http: HttpClient) {
        // Le chargement sera initié par les composants pour plus de contrôle
        // this.fetchPlans().subscribe();
    }

    /**
     * Récupère les plans depuis le backend
     */
    fetchPlans(): Observable<NetflixPlan[]> {
        return this.http.get<{ success: boolean, data: NetflixPlan[] }>(`${environment.apiUrl}/api/netflix/plans`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        }).pipe(
            map(res => res.success ? res.data : []),
            tap(plans => {
                if (plans.length > 0) {
                    this.plansSubject.next(plans);
                }
            }),
            catchError(err => {
                console.error('Erreur chargement plans:', err);
                return of([]);
            })
        );
    }

    /**
     * Get all currently loaded plans
     */
    getPlans(): NetflixPlan[] {
        return this.plansSubject.value;
    }

    /**
     * Get specific plan details
     */
    getPlanDetails(planId: string): NetflixPlan | undefined {
        return this.plansSubject.value.find(p => p.id === planId);
    }

    /**
     * Get currently selected plan key
     */
    getSelectedPlan(): string {
        return this.selectedPlanId;
    }

    /**
     * Set selected plan
     */
    setSelectedPlan(planId: string): void {
        this.selectedPlanId = planId;
    }

    /**
     * Get plan price
     */
    getPlanPrice(planId?: string): number {
        const id = planId || this.selectedPlanId;
        const plan = this.getPlanDetails(id);
        return plan ? plan.price : 10000;
    }

    /**
     * Get plan currency
     */
    getPlanCurrency(planId?: string): string {
        const id = planId || this.selectedPlanId;
        const plan = this.getPlanDetails(id);
        return plan ? plan.currency : 'XAF';
    }

    /**
     * Get plan title
     */
    getPlanTitle(planId?: string): string {
        const id = planId || this.selectedPlanId;
        const plan = this.getPlanDetails(id);
        return plan ? plan.title : 'Sélectionnez un plan';
    }

    /**
     * Get plan summary
     */
    getPlanSummary(planId?: string): string {
        const id = planId || this.selectedPlanId;
        const plan = this.getPlanDetails(id);
        return plan ? plan.summary : '';
    }

    /**
     * Get supported devices
     */
    getPlanDevices(planId?: string): string {
        const id = planId || this.selectedPlanId;
        const plan = this.getPlanDetails(id);
        return plan ? plan.support : '';
    }

    /**
     * Get simultaneous screens
     */
    getPlanSimultaneous(planId?: string): number {
        const id = planId || this.selectedPlanId;
        const plan = this.getPlanDetails(id);
        return plan ? plan.simultaneous : 1;
    }

    /**
     * Get downloads
     */
    getPlanDownloads(planId?: string): number {
        const id = planId || this.selectedPlanId;
        const plan = this.getPlanDetails(id);
        return plan ? plan.downloads : 1;
    }

    /**
     * Get resolution
     */
    getPlanResolution(planId?: string): string {
        const id = planId || this.selectedPlanId;
        const plan = this.getPlanDetails(id);
        return plan ? plan.resolution : 'HD';
    }

    /**
     * Navigation: Get current page
     */
    getCurrentPage(): number { return this.currentPage; }
    setCurrentPage(page: number): void { this.currentPage = page; }

    /**
     * Navigation: Get active step
     */
    getActiveStep(): number { return this.activeStep; }
    setActiveStep(step: number): void { this.activeStep = step; }

    /**
     * Navigation: Get current step number (for stepper UI)
     */
    getCurrentStepNumber(): number {
        if (this.currentPage === 1) return 1;
        if (this.currentPage === 1.5) return 2;
        if (this.currentPage === 2) return this.activeStep === 1 ? 3 : 4;
        if (this.currentPage === 5) return 5;
        if (this.currentPage === 6) return 6;
        return 1;
    }

    /**
     * Stepper progress
     */
    getStepperProgress(): number {
        return (this.getCurrentStepNumber() / 6) * 100;
    }

    /**
     * Navigation: Go to specific step
     */
    changeStep(step: number): void {
        const steps: { [key: number]: { p: number, s: number } } = {
            1: { p: 1, s: 1 },
            2: { p: 1.5, s: 1 },
            3: { p: 2, s: 1 },
            4: { p: 2, s: 2 },
            5: { p: 5, s: 1 },
            6: { p: 6, s: 1 }
        };
        if (steps[step]) {
            this.currentPage = steps[step].p;
            this.activeStep = steps[step].s;
        }
    }

    /**
     * Navigation: Go to previous page
     */
    previousPage(): void {
        if (this.currentPage === 2 && this.activeStep === 2) {
            this.activeStep = 1;
        } else if (this.currentPage === 2 && this.activeStep === 1) {
            this.currentPage = 1.5;
        } else if (this.currentPage === 1.5) {
            this.currentPage = 1;
        }
    }

    /**
     * Reset all state
     */
    reset(): void {
        this.selectedPlanId = 'premium';
        this.currentPage = 1;
        this.activeStep = 1;
    }
}

