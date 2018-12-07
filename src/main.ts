import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'hammerjs';

if (environment.production) {
  enableProdMode();
}

Cesium.buildModuleUrl.setBaseUrl('/node_modules/cesium/Build/Cesium/');
Cesium.BingMapsApi.defaultKey = 'AkjRLVj9YxU1hVvcW-Pc_J5UuPXmDFHiARQvs-_9VeZKjnKHqoW_rgOQaYo0kZLV';
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

