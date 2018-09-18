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
  selector: 'kml-layer',
  templateUrl: 'kml-layer.component.html'
})
export class KMLLayerComponent implements AfterViewInit, OnInit, BaseLayer {
  Cesium = Cesium;
  showTile = true;
  @Input()
  kmlSource: LayerSource;
  dataSource: any;

  constructor(private appConf: AppConfigService) {

  }

  public getLayerMeta(): LayerSource {
    return this.kmlSource;
  }

  public getLayerEntity() {
    return this.dataSource;
  }

  public showLayer(): void {
    this.showTile = true;
  }

  public hideLayer(): void {
    this.showTile = false;
  }

  public moveToLayer(): void {
    this.appConf.getAppViewer().flyTo(this.dataSource.entities);
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    this.appConf.getAppViewer().dataSources.add(Cesium.KmlDataSource
      .load(this.kmlSource.layerPath, {
          camera: this.appConf.getAppViewer().camera,
          canvas: this.appConf.getAppViewer().canvas
      })
    )
    .then(function (dataSource) {
        this.dataSource = dataSource;
    });
  }
}
