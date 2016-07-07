import { provideRouter, RouterConfig } from '@angular/router';
import {BackpressureComponent} from './+backpressure/backpressure.component';

export const routes: RouterConfig = [
  { path: 'backpressure', component: BackpressureComponent}
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
