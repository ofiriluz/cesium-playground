import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MapLayerProviderOptions, AcMapLayerProviderComponent } from 'angular-cesium';

@Component({
  selector: 'maps-layer',
  templateUrl: 'maps-layer.component.html'
})
export class MapsLayerComponent implements AfterViewInit {
  MapLayerProviderOptions = MapLayerProviderOptions;
  Cesium = Cesium;

  constructor() {}

  ngAfterViewInit(): void {
  }
}
