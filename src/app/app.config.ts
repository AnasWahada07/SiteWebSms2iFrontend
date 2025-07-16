import { ApplicationConfig, provideZonelessChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideNgxStripe } from 'ngx-stripe';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideNgxStripe('pk_test_51Rl4xlQShFsLJw6so0jiMDM6mOdRXWSRzD4kyyS3JGEgrRxe5YmSRmx1QVe74nHOc5aJxHEC5FtkkXgmja5FX7ZU00RQciSYYw') 
  ]
};
