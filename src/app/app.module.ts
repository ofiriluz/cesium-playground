import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AngularCesiumModule, AngularCesiumWidgetsModule } from 'angular-cesium';
import { AppComponent } from './app.component';
import { CesiumViewerComponent } from './cesium-viewer/cesium-viewer.component';
import { MapsLayerComponent } from './maps-layer/maps-layer.component';

const appRoutes: Routes = [{ path: '', component: CesiumViewerComponent }];

@NgModule({
  declarations: [AppComponent, CesiumViewerComponent, MapsLayerComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AngularCesiumModule.forRoot(),
    AngularCesiumWidgetsModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
