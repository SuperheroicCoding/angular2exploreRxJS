import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
// noinspection TypeScriptCheckImport
import { AppComponent, environment, APP_ROUTER_PROVIDERS } from './app/index';

if (environment.production) {
  enableProdMode();
}
bootstrap(AppComponent, [APP_ROUTER_PROVIDERS]);

