import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { PointsLayerComponent } from 'src/app/layers/points-layer/points-layer.component';
import { PolylineLayerComponent } from 'src/app/layers/polyline-layer/polyline-layer.component';
import { LayersListComponent } from 'src/app/layers-list/layers-list.component';
import { MouseCoordsComponent } from 'src/app/mouse-coords/mouse-coords.component';
import { AppConfigService } from 'src/app/services/app-config.service';
import { LayersAPIService } from 'src/app/services/layers-api.service';
import { SmartPhoneService } from 'src/app/services/smart-phone.service';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule,
  MatListModule, MatSelectModule, MatOptionModule,
  MatButtonModule, MatFormFieldModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { GeometryEditorComponent } from 'src/app/geometry-editor/geometry-editor.component';
import { GeoConverterService } from 'src/app/services/geo-convertor.service';
import { TerrainLayerComponent } from 'src/app/layers/terrain-layer/terrain-layer.component';
import { OrthoLayerComponent } from 'src/app/layers/ortho-layer/ortho-layer.component';
import { StreetsLayerComponent } from 'src/app/layers/streets-layer/streets-layer.component';
import { MapBoxService } from 'src/app/services/mapbox-service';
import { OverpassService } from 'src/app/services/overpass.service';
import { BuildingNumbersLayerComponent } from 'src/app/layers/building-numbers-layer/building-numbers-layer.component';

const appRoutes: Routes = [{ path: '', component: CesiumViewerComponent }];

@NgModule({
  declarations: [
    AppComponent,
    CesiumViewerComponent,
    MapLayerComponent,
    TileLayerComponent,
    KMLLayerComponent,
    SHPLayerComponent,
    TerrainLayerComponent,
    OrthoLayerComponent,
    StreetsLayerComponent,
    BuildingNumbersLayerComponent,
    LayersListComponent,
    GeometryEditorComponent,
    PointsLayerComponent,
    PolylineLayerComponent,
    MouseCoordsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AngularCesiumModule.forRoot(),
    AngularCesiumWidgetsModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false }),
    NgbModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatListModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  providers: [
    AppConfigService,
    LayersAPIService,
    SmartPhoneService,
    GeoConverterService,
    MapBoxService,
    OverpassService
  ],
  bootstrap: [AppComponent],
  entryComponents: [PointsLayerComponent, PolylineLayerComponent]
})
export class AppModule {}
