import { AfterViewInit, Component, ViewChild, Input } from '@angular/core';
import {
  MapLayerProviderOptions,
  AcMapLayerProviderComponent,
  ActionType,
  AcNotification,
  AcLayerComponent,
  SceneMode,
  ViewerConfiguration,
  CesiumService
} from 'angular-cesium';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { AppConfigService } from 'src/app/services/app-config.service';
import { BaseLayer } from 'src/app/layers/base-layer';
import { LayerSource } from 'src/app/models/layer-source.model';
import { SmartPhoneService } from 'src/app/services/smart-phone.service';

@Component({
  selector: 'tile-layer',
  providers: [CesiumService],
  templateUrl: 'tile-layer.component.html'
})
export class TileLayerComponent implements AfterViewInit, OnInit, BaseLayer {
  Cesium = Cesium;
  @Input()
  tileSource: LayerSource;
  @Input()
  tileIndex: number;
  @ViewChild('tileLayer')
  tileLayer: any;
  layerBoundingSphehre: any;
  tilesetInstance: any;

  constructor(private appConf: AppConfigService, public smartPhoneSrv: SmartPhoneService) {

  }

  public getLayerMeta(): LayerSource {
    return this.tileSource;
  }

  public getLayerEntity() {
    return this.tileLayer.tilesetInstance;
  }

  public getLayerBounds() {
    return this.layerBoundingSphehre;
  }

  public showLayer(): void {
    this.tilesetInstance.show = true;
  }

  public hideLayer(): void {
    this.tilesetInstance.show = false;
  }

  public isLayerVisible(): boolean {
    return this.tilesetInstance.show;
  }

  public moveToLayer(): void {
    this.appConf.getAppViewer().camera.flyToBoundingSphere(this.layerBoundingSphehre);
  }

  ngAfterViewInit(): void {
    this.tilesetInstance = new Cesium.Cesium3DTileset({
      url: this.tileSource.layerPath,
      maximumScreenSpaceError: this.smartPhoneSrv.any() ? 3 : 1,
      maximumNumberOfLoadedTiles: this.smartPhoneSrv.any() ? 300 : 1000
    });
    this.tilesetInstance.readyPromise.then(() => {
      this.layerBoundingSphehre = this.tilesetInstance.boundingSphere;
    });

    this.appConf.getAppViewer().scene.primitives.add(
      this.tilesetInstance
    );
  }
  ngOnInit(): void {

  }
}
