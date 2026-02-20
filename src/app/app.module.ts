import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { reducers } from './services/store/indx';
import { PayementComponent } from './payement/payement.component';
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
// import { CarouselModule } from 'ngx-bootstrap/carousel';
// import { MatTabsModule } from '@angular/material/tabs';
import { JeuxComponent } from './jeux/jeux.component';
import { AchatsComponent } from './achats/achats.component';
import { SiteComponent } from './site/site.component';
import { PhoneAuthComponent } from './phone-auth/phone-auth.component';
import { HttpClientModule } from '@angular/common/http';
import { AboutComponent } from './about/about.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


@NgModule({
  declarations: [AppComponent, PayementComponent, PartageComponent, CompteComponent, AddEditAccountComponent, ActusComponent, ComptepartagerComponent, FormulaireComponent, LoginPageComponent, SplashPageComponent, OnboardingPageComponent, JeuxComponent, AchatsComponent, SiteComponent, PhoneAuthComponent, AboutComponent, SubscriptionsComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    // Configuration NgRx
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retient les 25 derniers états
      logOnly: false, // Restreint l'extension en mode production
    })
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Utilisé pour supporter les composants Ionic
})
export class AppModule { }
