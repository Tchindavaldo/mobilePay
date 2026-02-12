import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// L'initialisation de Firebase est gérée dans src/firebase-config.ts
// import './firebase-config'; // Optionnel si déjà importé ailleurs

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
