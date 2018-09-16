import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

Cesium.buildModuleUrl.setBaseUrl('/node_modules/cesium/Build/Cesium/');
Cesium.BingMapsApi.defaultKey = 'AqDX2yBwC4viiXbZgKr4Vfv7ztERQ_IawGtGiK5Q87v-SNjT9eLZePVGmSdzegE8';
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

