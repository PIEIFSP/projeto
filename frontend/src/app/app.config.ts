import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  LucideAngularModule,
  House,
  Wallet,
  Calendar,
  Users,
  Scissors,
  LogOut
} from 'lucide-angular';

import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      LucideAngularModule.pick({
        House,
        Wallet,
        Calendar,
        Users,
        Scissors,
        LogOut,
      })
    )
  ]
};
