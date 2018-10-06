import { AfterViewInit, Component, ViewChild, Input } from '@angular/core';
import {
  MapLayerProviderOptions,
  AcMapLayerProviderComponent,
  ActionType,
  AcNotification,
  AcLayerComponent,
  SceneMode,
  ViewerConfiguration
} from 'angular-cesium';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { AppConfigService } from 'src/app/services/app-config.service';
import { BaseLayer } from 'src/app/layers/base-layer';
import { LayerSource } from 'src/app/models/layer-source.model';
import { LayersAPIService } from 'src/app/services/layers-api.service';

@Component({
  selector: 'ortho-layer',
  templateUrl: 'ortho-layer.component.html'
})
export class OrthoLayerComponent implements AfterViewInit, OnInit, BaseLayer {
  Cesium = Cesium;
  imageryProvider: any;
  showOrtho = true;
  @Input()
  orthoSource: LayerSource;
  @Input()
  orthoIndex: number;

  constructor(private appConf: AppConfigService, private layersService: LayersAPIService) {

  }

  public getLayerMeta(): LayerSource {
    return this.orthoSource;
  }

  public getLayerEntity() {
    return null;
  }

  public showLayer(): void {
    this.showOrtho = true;
    this.imageryProvider.show = true;
  }

  public hideLayer(): void {
    this.showOrtho = false;
    this.imageryProvider.show = false;
  }

  public isLayerVisible(): boolean {
    return this.showOrtho;
  }

  public moveToLayer(): void {

  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    this.imageryProvider = this.appConf.getAppViewer().scene.imageryLayers.addImageryProvider(
      Cesium.createTileMapServiceImageryProvider({
        url: this.orthoSource.layerPath
      })
    );
  }
}
