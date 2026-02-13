import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PayementComponent } from './payement/payement.component';
import { NotificationComponent } from './notification/notification.component';
import { SupportComponent } from './support/support.component';
import { PartageComponent } from './partage/partage.component';
import { CompteComponent } from './compte/compte.component';
import { AddEditAccountComponent } from './add-edit-account/add-edit-account.component';
import { ActusComponent } from './actus/actus.component';
import { ComptepartagerComponent } from './comptepartager/comptepartager.component';
import { FormulaireComponent } from './formulaire/formulaire.component';
import { SplashPageComponent } from './splash.page/splash.page.component';
import { LoginPageComponent } from './login.page/login.page.component';
import { OnboardingPageComponent } from './onboarding.page/onboarding.page.component';
import { JeuxComponent } from './jeux/jeux.component';
import { SiteComponent } from './site/site.component';
import { AchatsComponent } from './achats/achats.component';
import { PhoneAuthComponent } from './phone-auth/phone-auth.component';
import { ProfilePage } from './profile/profile.page';
import { AboutComponent } from './about/about.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login', // Le app.component redirigera vers /tabs/tab1 si déjà connecté
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'pay',
    component: PayementComponent
  },
  {
    path: 'notif',
    component: NotificationComponent
  },
  {
    path: 'support',
    component: SupportComponent
  },
  {
    path: 'partage',
    component: PartageComponent
  },
  {
    path: 'compte',
    component: CompteComponent
  },
  {
    path: 'add',
    component: AddEditAccountComponent
  },
  {
    path: 'actus',
    component: ActusComponent
  },
  {
    path: 'plan',
    component: ComptepartagerComponent
  },
  {
    path: 'forms',
    component: FormulaireComponent
  },
  {
    path: 'explication',
    component: OnboardingPageComponent
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'jeux',
    component: JeuxComponent
  },
  {
    path: 'site',
    component: SiteComponent
  },
  {
    path: 'achats',
    component: AchatsComponent
  },
  {
    path: 'phone-auth',
    component: PhoneAuthComponent
  },
  {
    path: 'activations',
    loadChildren: () => import('./activations/activations.module').then(m => m.ActivationsPageModule)
  },
  {
    path: 'profile',
    component: ProfilePage
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'subscriptions',
    component: SubscriptionsComponent
  },
  {
    path: 'pay2',
    loadChildren: () => import('./pay2/pay2.module').then(m => m.Pay2PageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
