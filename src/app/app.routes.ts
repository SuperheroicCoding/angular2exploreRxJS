import { provideRouter, RouterConfig } from '@angular/router';
import {BackpressureComponent} from './+backpressure/index';
import {MarioComponent} from './+mario/index';

export const routes: RouterConfig = [
  { path: 'backpressure', component: BackpressureComponent},
  { path: 'mario', component: MarioComponent}
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
