# 📱 MobilePay - Application de Paiement Mobile Multiplateforme

![Version](https://img.shields.io/badge/version-0.0.1-blue)
![Angular](https://img.shields.io/badge/Angular-16.0.0-red)
![Ionic](https://img.shields.io/badge/Ionic-8.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey)

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Fonctionnalités](#fonctionnalités)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Structure du Projet](#structure-du-projet)
7. [Services](#services)
8. [Composants Principaux](#composants-principaux)
9. [Système de Paiement](#système-de-paiement)
10. [Authentification](#authentification)
11. [Communication en Temps Réel](#communication-en-temps-réel)
12. [Stockage des Données](#stockage-des-données)
13. [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

**MobilePay** est une application mobile hybride complète de gestion de paiements et d'abonnements. Elle permet aux utilisateurs de :

- ✅ S'authentifier via Google
- ✅ Gérer leurs abonnements (plans multiples)
- ✅ Effectuer des paiements par mobile money
- ✅ Consulter l'historique des transactions
- ✅ Gérer plusieurs comptes
- ✅ Recevoir des notifications en temps réel
- ✅ Partager des comptes avec d'autres utilisateurs
- ✅ Accéder à du contenu exclusif (jeux, actualités)

### Plans d'Abonnement

| Plan | Prix | Résolution | Caractéristiques |
|---|---|---|---|
| 📱 Mobile | 3.99€ | 480p | Basique, Mobile |
| 🎯 Essentiel | 4.99€ | 720p HD | Qualité HD |
| 🎬 Standard | 8.99€ | 1080p Full HD | Haute qualité |
| 👑 Premium | 10.99€ | 4K Ultra HD | Meilleure qualité |

---

## 🏗️ Architecture

### Stack Technologique

| Couche | Technologie | Version |
|---|---|---|
| **Framework** | Angular | 16.0.0 |
| **Mobile** | Ionic | 8.0.0 |
| **Capacitor** | Capacitor | 6.x |
| **État** | NgRx | 16.3.0 |
| **Backend** | Firebase | 10.12.2 |
| **Communication** | Socket.IO | 4.8.1 |
| **Authentification** | Google Auth | Capacitor Plugin |
| **Stockage** | Secure Storage | Capacitor Plugin |

### Couches de l'Application

```
┌─────────────────────────────────────────────────────────┐
│        Présentation (Composants Angular + UI)           │
├─────────────────────────────────────────────────────────┤
│        Services (Auth, Payment, User, Socket)           │
├─────────────────────────────────────────────────────────┤
│        État (NgRx Store, Actions, Reducers)             │
├─────────────────────────────────────────────────────────┤
│   Données (Firebase, API REST, Socket.IO, Storage)      │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité
- Google Sign-In avec Capacitor
- Secure Storage chiffré
- Session Management automatique
- Token Refresh
- Logout sécurisé

### 💳 Système de Paiement
- 4 plans d'abonnement
- Mobile Money, Cartes, Portefeuilles
- Validation en temps réel via Socket.IO
- Confirmation instantanée
- Reçus de transaction

### 👤 Gestion Utilisateur
- Profil personnalisable
- Comptes multiples
- Partage de compte
- Historique complet
- Préférences personnalisées

### 🔔 Notifications
- Notifications en temps réel (Socket.IO)
- Notifications locales (Capacitor)
- Push Notifications
- Centre de notifications

### 🎮 Contenu Exclusif
- Jeux exclusifs
- Actualités personnalisées
- Boutique intégrée
- Support client

---

## 📦 Installation

### Prérequis

```bash
node --version  # v18+ recommandé
npm --version   # v9+
npm install -g @ionic/cli
npm install -g @angular/cli@16
npm install -g @capacitor/cli
```

### Étapes

```bash
# 1. Cloner le projet
git clone https://gitlab.com/michael1900529/mobilepay.git
cd mobilepay

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp src/environments/environment.ts.example src/environments/environment.ts

# 4. Démarrer en développement
ionic serve

# 5. Ou sur mobile
ionic capacitor run ios    # iOS
ionic capacitor run android # Android
```

---

## ⚙️ Configuration

### Firebase (src/firebase-config.ts)

```typescript
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

export const app = initializeApp(firebaseConfig);
```

### Environnement (src/environments/environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  firebaseConfig: { /* ... */ }
};
```

### Capacitor (capacitor.config.ts)

```typescript
const config: CapacitorConfig = {
  appId: 'com.mobilepay.app',
  appName: 'MobilePay',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'YOUR_SERVER_CLIENT_ID'
    }
  }
};
```

---

## 📂 Structure du Projet

```
mobilepay/
├── src/app/
│   ├── services/
│   │   ├── auth/                    # Authentification
│   │   ├── user/                    # Gestion utilisateur
│   │   ├── payment/                 # Paiements
│   │   ├── socket/                  # Socket.IO
│   │   ├── storage/                 # Stockage sécurisé
│   │   ├── api/                     # Appels API
│   │   └── store/                   # NgRx Store
│   ├── pages/
│   │   ├── tab1/                    # Accueil
│   │   ├── tab2/                    # Transactions
│   │   ├── tab3/                    # Profil
│   │   ├── tab4/                    # Paramètres
│   │   ├── login.page/              # Connexion
│   │   ├── onboarding.page/         # Onboarding
│   │   ├── payement/                # Paiement
│   │   ├── notification/            # Notifications
│   │   ├── support/                 # Support
│   │   ├── compte/                  # Gestion compte
│   │   ├── partage/                 # Partage
│   │   ├── actus/                   # Actualités
│   │   ├── jeux/                    # Jeux
│   │   └── achats/                  # Achats
│   ├── models/
│   │   └── payment.model.ts         # Interfaces
│   ├── shared/                      # Composants partagés
│   ├── tabs/                        # Navigation
│   ├── app-routing.module.ts        # Routing
│   └── app.component.ts             # Composant racine
├── environments/
│   ├── environment.ts               # Dev
│   └── environment.prod.ts          # Production
├── assets/
├── theme/
├── firebase-config.ts
├── angular.json
├── capacitor.config.ts
├── ionic.config.json
└── package.json
```

---

## 🔧 Services Principaux

### AuthService (src/app/services/auth/auth.service.ts)

Gère l'authentification Google et les utilisateurs.

```typescript
signInWithGoogle(): Promise<any>
signOut(): Promise<void>
isAuthenticated(): Promise<boolean>
getCurrentUser(): Promise<any>
refreshUser(): Promise<any>
```

### PaymentService (src/app/services/payment.service.ts)

Gère les paiements et les plans.

```typescript
initiateMobileMoneyPayment(paymentData): Observable<PaymentResponse>
getPlanInfo(planType): PlanInfo
validatePhoneNumber(phoneNumber): boolean
validateEmail(email): boolean
```

### SocketService (src/app/services/socket/socket.service.ts)

Gère la communication en temps réel.

```typescript
initializeAllSockets(): void
getSocket(): Socket
disconnect(): void
```

### UserStorageService (src/app/services/storage/user-storage.service.ts)

Stockage sécurisé des données.

```typescript
set(key: string, value: any): Promise<void>
get(key: string): Promise<any>
remove(key: string): Promise<void>
clear(): Promise<void>
```

### UserDataService (src/app/services/user/data/user-data.service.ts)

Gestion des données utilisateur en mémoire.

```typescript
user: User | null
initCurrentUser(): Promise<void>
updateUser(userData): void
clearUser(): void
```

---

## 🎨 Composants Principaux

### Tab1Page (Accueil)
- Tableau de bord utilisateur
- Plan d'abonnement actuel
- Raccourcis vers les fonctionnalités
- Carrousel de contenu
- Notifications

### PayementComponent (Paiement)
Stepper multi-étapes :
1. Sélection du plan
2. Méthode de paiement
3. Informations de paiement
4. Confirmation
5. Reçu

### LoginPageComponent (Connexion)
- Authentification Google
- Authentification par téléphone
- Récupération de mot de passe
- Inscription

### Tab2Page (Transactions)
- Historique des transactions
- Filtrage et recherche
- Détails de transaction
- Téléchargement de reçus

### Tab3Page (Profil)
- Modification des informations
- Gestion des comptes
- Préférences
- Paramètres de sécurité

### NotificationComponent (Notifications)
- Historique des notifications
- Marquage comme lu
- Suppression
- Filtrage

---

## 💳 Système de Paiement

### Flux de Paiement

```
Sélection du Plan
        ↓
Sélection Méthode de Paiement
        ↓
Saisie des Informations
        ↓
Confirmation du Paiement
        ↓
Validation Socket.IO
        ↓
Affichage du Reçu
```

### Modèles de Données

```typescript
interface PaymentRequest {
  numeroOM: string;
  email: string;
  motDePasse?: string;
  typeDePlan: PlanType;
  userId: string;
  amount: number;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  orderId?: string;
  transactionId?: string;
  data?: any;
}

type PlanType = 'mobile' | 'basic' | 'standard' | 'premium';

interface PlanInfo {
  type: PlanType;
  price: number;
  name: string;
  resolution: string;
}
```

### Intégration Socket.IO

```typescript
// Écoute de la validation
socket.on('payment_validated', (data) => {
  if (data.userId === currentUserId) {
    showReceipt(data);
  }
});

// Émission de l'initiation
socket.emit('payment_initiated', paymentData);
```

---

## 🔐 Authentification

### Flux Google Auth

```
Clic "Connexion Google"
        ↓
GoogleAuth.signIn()
        ↓
Vérification utilisateur en BD
        ↓
Création si nécessaire
        ↓
Stockage local sécurisé
        ↓
Mise à jour de l'état
        ↓
Redirection vers tableau de bord
```

### Sécurité

- Secure Storage chiffré
- Token Management automatique
- Session Timeout
- Communication HTTPS

---

## 🔌 Communication en Temps Réel

### Événements Socket.IO

| Événement | Direction | Description |
|---|---|---|
| `payment_initiated` | Client → Serveur | Initiation paiement |
| `payment_validated` | Serveur → Client | Validation paiement |
| `notification_received` | Serveur → Client | Nouvelle notification |
| `user_updated` | Serveur → Client | Mise à jour utilisateur |
| `transaction_completed` | Serveur → Client | Transaction complétée |
| `session_started` | Client → Serveur | Démarrage session |
| `session_ended` | Client → Serveur | Fin session |

### Initialisation

```typescript
// Dans tabs.page.ts
ngOnInit() {
  this.socketService.initializeAllSockets();
}

// Écoute d'événements
socket.on('payment_validated', (data) => {
  console.log('Paiement validé:', data);
});
```

---

## 💾 Stockage des Données

### Secure Storage (Données Sensibles)
- Données utilisateur
- Tokens d'authentification
- Informations de paiement
- Préférences personnelles

### LocalStorage (Données Non-Sensibles)
- Onboarding vu
- Thème préféré
- Langue
- Paramètres UI

### Firebase (Backend)
- Profils utilisateurs
- Historique transactions
- Données d'abonnement
- Notifications

---

## 🚀 Déploiement

### Build Production

```bash
# Web
ng build --configuration production

# iOS
ionic capacitor build ios --prod

# Android
ionic capacitor build android --prod
```

### Déploiement Web

```bash
# Netlify
npm run build
netlify deploy --prod --dir=www

# Firebase Hosting
firebase deploy --only hosting
```

### Déploiement Mobile

**iOS** :
- Ouvrir dans Xcode : `ios/App/App.xcworkspace`
- Configurer le signing
- Archiver et soumettre à l'App Store

**Android** :
- Ouvrir dans Android Studio : `android/`
- Configurer le signing
- Générer APK/AAB
- Soumettre à Google Play

---

## 📊 Gestion d'État (NgRx)

```typescript
// Dispatch une action
store.dispatch(UserActions.loadUser({ userId: '123' }));

// Sélectionner l'état
user$ = store.select(selectCurrentUser);

// Souscrire aux changements
user$.subscribe(user => {
  console.log('Utilisateur:', user);
});
```

---

## 🧪 Tests

```bash
# Tests unitaires
ng test

# Tests e2e
ng e2e

# Lint
ng lint
```

---

## 📝 Commandes Utiles

```bash
# Démarrage
npm start                    # Serveur de développement
ionic serve                  # Serveur Ionic
ionic serve --lab           # Avec aperçu iOS/Android

# Build
npm run build               # Build production
ng build --watch            # Build avec surveillance

# Capacitor
ionic capacitor add ios     # Ajouter iOS
ionic capacitor add android # Ajouter Android
ionic capacitor run ios     # Exécuter sur iOS
ionic capacitor run android # Exécuter sur Android
ionic capacitor sync        # Synchroniser les fichiers

# Nettoyage
npm cache clean --force
rm -rf node_modules
npm install
```

---

## 🐛 Dépannage

### Problème : "Cannot find module '@angular/...'"
```bash
npm install
npm cache clean --force
```

### Problème : "Capacitor plugin not found"
```bash
ionic capacitor sync
```

### Problème : "Google Auth not working"
- Vérifier le Client ID dans environment.ts
- Vérifier les URI autorisés dans Google Cloud Console
- Vérifier la configuration dans capacitor.config.ts

### Problème : "Socket.IO connection failed"
- Vérifier l'URL de l'API dans environment.ts
- Vérifier que le serveur backend est en cours d'exécution
- Vérifier les CORS sur le serveur

### Problème : "Secure Storage not working"
- Sur iOS : Vérifier les entitlements
- Sur Android : Vérifier les permissions
- Sur Web : Utiliser localStorage comme fallback

---

## 📚 Documentation Supplémentaire

- [Angular Documentation](https://angular.io/docs)
- [Ionic Documentation](https://ionicframework.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [NgRx Documentation](https://ngrx.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Socket.IO Documentation](https://socket.io/docs/)

---

## 👥 Contribution

Les contributions sont bienvenues ! Veuillez :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

Ce projet est sous license MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitLab
- Contacter le support via l'application
- Email : support@mobilepay.com

---

## 🎉 Remerciements

Merci à tous les contributeurs et à la communauté Angular/Ionic !

---

**Dernière mise à jour** : Novembre 2025
**Auteur** : Michel (michael1900529)
**Statut** : En développement actif 🚀
