import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import {
  AngularCesiumModule,
  AngularCesiumWidgetsModule
} from 'angular-cesium';
import { AppComponent } from './app.component';
import { CesiumViewerComponent } from './cesium-viewer/cesium-viewer.component';
import { MapLayerComponent } from 'src/app/layers/map-layer/map-layer.component';
import { KMLLayerComponent } from 'src/app/layers/kml-layer/kml-layer.component';
import { SHPLayerComponent } from 'src/app/layers/shp-layer/shp-layer.component';
import { TileLayerComponent } from 'src/app/layers/tile-layer/tile-layer.component';
import { AppConfigService } from 'src/app/services/app-config.service';
import { LayersAPIService } from 'src/app/services/layers-api.service';
import { SmartPhoneService } from 'src/app/services/smart-phone.service';

const appRoutes: Routes = [{ path: '', component: CesiumViewerComponent }];

@NgModule({
  declarations: [
    AppComponent,
    CesiumViewerComponent,
    MapLayerComponent,
    TileLayerComponent,
    KMLLayerComponent,
    SHPLayerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AngularCesiumModule.forRoot(),
    AngularCesiumWidgetsModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false })
  ],
  providers: [
    AppConfigService,
    LayersAPIService,
    SmartPhoneService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
