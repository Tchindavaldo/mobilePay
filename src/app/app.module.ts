import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { MatTabsModule } from '@angular/material/tabs';


import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


@NgModule({
  declarations: [AppComponent, PayementComponent,NotificationComponent,SupportComponent,PartageComponent,CompteComponent,AddEditAccountComponent,ActusComponent,ComptepartagerComponent,FormulaireComponent,LoginPageComponent,SplashPageComponent,OnboardingPageComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,FormsModule,CarouselModule.forRoot(),MatTabsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideAnimationsAsync()],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Utilisé pour supporter les composants Ionic
})
export class AppModule {}
