import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '../services/language.service';

interface SupportCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Priority {
  value: string;
  label: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  expanded?: boolean;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  steps: string[];
  category: string;
}

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent implements OnInit {
  // Form data
  userName: string = '';
  userEmail: string = '';
  subject: string = '';
  message: string = '';
  
  // Search functionality
  searchQuery: string = '';
  
  // Form management
  showContactForm: boolean = false;
  currentFormStep: number = 1;
  selectedCategory: string = '';
  selectedPriority: string = 'medium';
  
  // Pages de support
  currentPage: string = 'main'; // main, chat, faq, guides
  
  // Chat functionality
  chatMessage: string = '';
  
  // Resource counts
  faqCount: number = 25;
  docsCount: number = 12;
  tutorialsCount: number = 8;
  communityCount: number = 1247;
  
  // Support categories
  supportCategories: SupportCategory[] = [
    {
      id: 'account',
      name: 'Compte & Profil',
      description: 'Gestion de votre compte utilisateur',
      icon: 'person-circle'
    },
    {
      id: 'payment',
      name: 'Paiements',
      description: 'Problèmes de facturation et paiements',
      icon: 'card'
    },
    {
      id: 'streaming',
      name: 'Services Streaming',
      description: 'Problèmes avec Netflix, Disney+, etc.',
      icon: 'tv'
    },
    {
      id: 'technical',
      name: 'Problème Technique',
      description: 'Bugs et dysfonctionnements',
      icon: 'construct'
    },
    {
      id: 'feature',
      name: 'Nouvelle Fonctionnalité',
      description: 'Suggestions d\'amélioration',
      icon: 'bulb'
    },
    {
      id: 'other',
      name: 'Autre',
      description: 'Autres questions ou demandes',
      icon: 'help-circle'
    }
  ];
  
  // Priority levels
  priorities: Priority[] = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Normale' },
    { value: 'high', label: 'Élevée' },
    { value: 'urgent', label: 'Urgente' }
  ];

  // FAQ Data
  faqItems: FAQItem[] = [
    {
      id: 'faq1',
      question: 'Comment créer un compte MoobilPay ?',
      answer: 'Pour créer un compte MoobilPay, téléchargez l\'application, cliquez sur "S\'inscrire", renseignez vos informations personnelles et validez votre numéro de téléphone.',
      category: 'account'
    },
    {
      id: 'faq2',
      question: 'Comment ajouter un compte de streaming ?',
      answer: 'Allez dans l\'onglet "Comptes", cliquez sur le bouton "+", sélectionnez votre plateforme (Netflix, Disney+, etc.) et renseignez les informations de votre compte.',
      category: 'streaming'
    },
    {
      id: 'faq3',
      question: 'Mes paiements sont-ils sécurisés ?',
      answer: 'Oui, tous les paiements sont sécurisés avec un chiffrement SSL 256 bits et nous ne stockons jamais vos informations bancaires complètes.',
      category: 'payment'
    },
    {
      id: 'faq4',
      question: 'Comment modifier mon profil ?',
      answer: 'Allez dans l\'onglet "Profil", cliquez sur "Modifier le profil", apportez vos modifications et sauvegardez.',
      category: 'account'
    },
    {
      id: 'faq5',
      question: 'Que faire si j\'ai oublié mon mot de passe ?',
      answer: 'Sur la page de connexion, cliquez sur "Mot de passe oublié", entrez votre email et suivez les instructions reçues par email.',
      category: 'account'
    }
  ];

  // Guides Data
  guideItems: GuideItem[] = [
    {
      id: 'guide1',
      title: 'Configuration initiale de MoobilPay',
      description: 'Guide complet pour bien démarrer avec MoobilPay',
      steps: [
        'Téléchargez l\'application MoobilPay depuis votre store',
        'Créez votre compte avec votre numéro de téléphone',
        'Vérifiez votre identité avec le code SMS reçu',
        'Configurez votre profil et photo',
        'Ajoutez votre premier compte de streaming'
      ],
      category: 'getting-started'
    },
    {
      id: 'guide2',
      title: 'Gestion des comptes de streaming',
      description: 'Comment ajouter, modifier et supprimer vos comptes',
      steps: [
        'Accédez à l\'onglet "Comptes"',
        'Cliquez sur le bouton "+" pour ajouter un compte',
        'Sélectionnez votre plateforme de streaming',
        'Renseignez les informations de connexion',
        'Configurez le statut (actif/inactif) selon vos besoins'
      ],
      category: 'accounts'
    },
    {
      id: 'guide3',
      title: 'Sécurité et confidentialité',
      description: 'Protégez votre compte et vos données',
      steps: [
        'Activez l\'authentification à deux facteurs',
        'Utilisez un mot de passe fort et unique',
        'Vérifiez régulièrement vos connexions actives',
        'Ne partagez jamais vos identifiants',
        'Signalez toute activité suspecte'
      ],
      category: 'security'
    }
  ];

  constructor(
    public langService: LanguageService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const page = params.get('page');
      if (page) {
        this.currentPage = page;
      }
    });
  }

  t(key: string): string {
    return this.langService.translate(key);
  }

  // Navigation
  goBack(): void {
    if (this.currentPage !== 'main') {
      this.currentPage = 'main';
    } else {
      window.history.back();
    }
  }

  // Navigation vers les pages
  navigateToPage(page: string): void {
    this.currentPage = page;
  }

  // Search functionality
  onSearchInput(event: any): void {
    const query = event.target.value;
    console.log('Recherche:', query);
    // Implement search logic here
  }

  // Contact form management
  toggleContactForm(): void {
    this.showContactForm = !this.showContactForm;
    if (this.showContactForm) {
      this.currentFormStep = 1;
    }
  }

  // Form step navigation
  nextFormStep(): void {
    if (this.canProceedToNextStep() && this.currentFormStep < 3) {
      this.currentFormStep++;
    }
  }

  previousFormStep(): void {
    if (this.currentFormStep > 1) {
      this.currentFormStep--;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentFormStep) {
      case 1:
        return !!this.selectedCategory;
      case 2:
        return !!(this.userName && this.userEmail && this.subject && this.message);
      case 3:
        return true;
      default:
        return false;
    }
  }

  canSendMessage(): boolean {
    return !!(this.selectedCategory && this.userName && this.userEmail && this.subject && this.message);
  }

  // Category selection
  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  getSelectedCategoryName(): string {
    const category = this.supportCategories.find(c => c.id === this.selectedCategory);
    return category ? category.name : 'Non définie';
  }

  // Priority selection
  selectPriority(priority: string): void {
    this.selectedPriority = priority;
  }

  getSelectedPriorityLabel(): string {
    const priority = this.priorities.find(p => p.value === this.selectedPriority);
    return priority ? priority.label : 'Normale';
  }

  // Send message
  sendMessage(): void {
    if (!this.canSendMessage()) {
      return;
    }

    const supportTicket = {
      category: this.selectedCategory,
      priority: this.selectedPriority,
      name: this.userName,
      email: this.userEmail,
      subject: this.subject,
      message: this.message,
      timestamp: new Date().toISOString()
    };

    console.log('Ticket de support créé:', supportTicket);
    
    // Here you would typically send the data to your backend
    // For now, we'll just show a success message
    alert('Votre demande a été envoyée avec succès ! Nous vous répondrons dans les plus brefs délais.');
    
    // Reset form
    this.resetForm();
  }

  resetForm(): void {
    this.userName = '';
    this.userEmail = '';
    this.subject = '';
    this.message = '';
    this.selectedCategory = '';
    this.selectedPriority = 'medium';
    this.currentFormStep = 1;
    this.showContactForm = false;
  }

  // Contact methods
  contactSupport(method: string): void {
    switch (method) {
      case 'email':
        this.toggleContactForm();
        break;
      case 'chat':
        this.navigateToPage('chat');
        break;
      case 'phone':
        window.open('tel:+237698178925');
        break;
    }
  }

  // Ticket creation
  openTicket(): void {
    this.showContactForm = true;
    this.currentFormStep = 1;
  }

  // Resource navigation
  openFAQ(): void {
    this.navigateToPage('faq');
  }

  openDocumentation(): void {
    this.navigateToPage('guides');
  }

  openTutorials(): void {
    // Redirection vers YouTube
    window.open('https://www.youtube.com/channel/UCW7relwlc0cdJpe90ORJCjw', '_blank');
  }

  openCommunity(): void {
    // Redirection vers WhatsApp
    window.open('https://chat.whatsapp.com/J5KaIQH02NpBa1lNnfcfpB', '_blank');
  }

  // Chat functionality
  sendChatMessage(): void {
    if (this.chatMessage.trim()) {
      console.log('Message envoyé:', this.chatMessage);
      // Ici on ajouterait la logique pour envoyer le message au chat
      this.chatMessage = '';
    }
  }

  sendQuickMessage(message: string): void {
    console.log('Message rapide envoyé:', message);
    // Ici on ajouterait la logique pour envoyer le message rapide
  }
}
