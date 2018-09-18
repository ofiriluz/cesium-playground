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

@Component({
  selector: 'tile-layer',
  templateUrl: 'tile-layer.component.html'
})
export class TileLayerComponent implements AfterViewInit, OnInit, BaseLayer {
  Cesium = Cesium;
  @Input()
  tileSource: LayerSource;
  @Input()
  tileIndex: number;
  @ViewChild('tile-layer')
  tileLayer: any;
  layerBoundingSphehre: any;
  showTile = true;

  constructor(private appConf: AppConfigService) {

  }

  public getLayerMeta(): LayerSource {
    return this.tileSource;
  }

  public getLayerEntity() {
    return this.tileLayer.tilesetInstance;
  }

  public showLayer(): void {
    this.showTile = true;
  }

  public hideLayer(): void {
    this.showTile = false;
  }

  public moveToLayer(): void {
    this.appConf.getAppViewer().camera.flyToBoundingSphere(this.layerBoundingSphehre);
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    // Get the 3d layer bounding sphere
    const tilesetInstance = this.tileLayer.tilesetInstance;
    this.layerBoundingSphehre = tilesetInstance.boundingSphere;
  }
}
