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
  selector: 'terrain-layer',
  templateUrl: 'terrain-layer.component.html'
})
export class TerrainLayerComponent implements AfterViewInit, OnInit, BaseLayer {
  Cesium = Cesium;
  showTerrain = true;
  @Input()
  terrainSource: LayerSource;
  @Input()
  terrainIndex: number;
  terrainProvider: any;

  constructor(private appConf: AppConfigService, private layersService: LayersAPIService) {

  }

  public getLayerMeta(): LayerSource {
    return this.terrainSource;
  }

  public getLayerEntity() {
    return null;
  }

  public showLayer(): void {
    this.terrainProvider.show = true;
    this.showTerrain = true;
    this.appConf.getAppViewer().terrainProvider = this.terrainProvider;
  }

  public hideLayer(): void {
    this.terrainProvider.show = false;
    this.showTerrain = false;
    this.appConf.getAppViewer().terrainProvider = new Cesium.EllipsoidTerrainProvider({});
  }

  public isLayerVisible(): boolean {
    return this.showTerrain;
  }

  public moveToLayer(): void {

  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    this.terrainProvider = new Cesium.CesiumTerrainProvider({
      url: this.terrainSource.layerPath
    });

    this.appConf.getAppViewer().terrainProvider = this.terrainProvider;
  }
}
