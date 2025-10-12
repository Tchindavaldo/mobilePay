# Service d'Authentification Google Auth + Backend

## 📁 Structure des Services

```
src/app/services/
├── auth/
│   ├── auth.service.ts          # Service principal d'authentification
│   └── README.md                 # Cette documentation
├── storage/
│   └── user-storage.service.ts  # Gestion du stockage sécurisé (localStorage/SecureStorage)
└── user/
    ├── data/
    │   └── user-data.service.ts # Gestion de l'utilisateur en mémoire
    └── requests/
        ├── get-user.service.ts     # GET /api/users/uid/:uid
        └── create-user.service.ts  # POST /api/users/

```

## 🔐 Flux d'Authentification

1. **Connexion Google** → Authentification avec Google Auth
2. **Vérification Backend** → GET `/api/users/uid/:uid`
3. **Création si nécessaire** → POST `/api/users/` (si user n'existe pas)
4. **Stockage local** → Sauvegarde dans SecureStorage ou localStorage
5. **Mise à jour mémoire** → UserDataService synchronisé

## 🚀 Utilisation

### Dans un composant (ex: LoginPage)

```typescript
import { Component } from "@angular/core";
import { AuthService } from "src/app/services/auth/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
})
export class LoginPage {
  constructor(private authService: AuthService, private router: Router) {}

  async loginWithGoogle() {
    try {
      const user = await this.authService.signInWithGoogle();
      console.log("Utilisateur connecté:", user);

      // Rediriger vers la page d'accueil
      this.router.navigate(["/tabs/tab1"]);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      // Afficher un message d'erreur à l'utilisateur
    }
  }

  async logout() {
    try {
      await this.authService.signOut();
      console.log("Déconnexion réussie");

      // Rediriger vers la page de login
      this.router.navigate(["/login"]);
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  }

  async checkAuth() {
    const isAuth = await this.authService.isAuthenticated();
    console.log("Est authentifié?", isAuth);
  }
}
```

### Dans le template HTML

```html
<ion-button (click)="loginWithGoogle()" expand="block">
  <ion-icon name="logo-google" slot="start"></ion-icon>
  Se connecter avec Google
</ion-button>

<ion-button (click)="logout()" fill="outline"> Déconnexion </ion-button>
```

## ⚙️ Configuration

### 1. Google Client ID

Dans `auth.service.ts`, ligne 30, remplacez :

```typescript
clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
```

Par votre vrai Client ID Google obtenu depuis :
[Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 2. URL Backend

Dans `src/environments/environment.ts` et `environment.prod.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: "https://votre-backend-url.com", // URL de votre backend
};
```

## 📡 Endpoints Backend Requis

Votre backend doit implémenter ces 2 endpoints :

### GET `/api/users/uid/:uid`

Récupère un utilisateur par son UID Google

**Réponse success (200)** :

```json
{
  "data": {
    "uid": "google-uid-123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://...",
    "createdAt": "2025-01-10T..."
  }
}
```

**Réponse user non trouvé (404)** :

```json
{
  "error": "User not found"
}
```

### POST `/api/users/`

Crée un nouvel utilisateur

**Body** :

```json
{
  "uid": "google-uid-123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://..."
}
```

**Réponse (201)** :

```json
{
  "data": {
    "uid": "google-uid-123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://...",
    "createdAt": "2025-01-10T..."
  }
}
```

## 🔄 Récupérer l'utilisateur actuel

```typescript
import { UserDataService } from "src/app/services/user/data/user-data.service";

export class MonComposant {
  constructor(private userData: UserDataService) {}

  ngOnInit() {
    const currentUser = this.userData.getCurrentUser();
    console.log("Utilisateur actuel:", currentUser);
  }
}
```

## 🔒 Sécurité

- **Mobile (Capacitor)** : Utilise SecureStoragePlugin (chiffré)
- **Web** : Utilise localStorage (non chiffré)
- Le service détecte automatiquement la plateforme

## 📝 Notes

- L'utilisateur est automatiquement créé dans la BD s'il n'existe pas
- Les données sont synchronisées : Backend ↔ Storage ↔ Mémoire
- La méthode `refreshUser()` permet de récupérer les données à jour depuis la BD
