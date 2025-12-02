import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  LucideAngularModule,
  House,
  Wallet,
  Calendar,
  Users,
  Scissors
} from 'lucide-angular';

import { provideHttpClient, withInterceptors} from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([
        AuthInterceptor
      ])
    ),

    
    importProvidersFrom(
      LucideAngularModule.pick({
        House,
        Wallet,
        Calendar,
        Users,
        Scissors
      })
    )
  ]
};
