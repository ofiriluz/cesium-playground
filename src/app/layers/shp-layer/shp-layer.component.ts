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
  selector: 'shp-layer',
  templateUrl: 'shp-layer.component.html'
})
export class SHPLayerComponent implements AfterViewInit, OnInit, BaseLayer {
  Cesium = Cesium;
  showTile = true;
  @Input()
  shpSource: LayerSource;
  dataSource: any;

  constructor(private appConf: AppConfigService, private layersService: LayersAPIService) {

  }

  public getLayerMeta(): LayerSource {
    return this.shpSource;
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
    this.layersService.getShpAsGeoJson(this.shpSource.layerPath).toPromise().then((jsonData) => {
      this.appConf.getAppViewer().dataSources.add(Cesium.GeoJsonDataSource.load(jsonData), {
        stroke: Cesium.Color.HOTPINK,
        fill: Cesium.Color.PINK,
        strokeWidth: 3,
        markerSymbol: '?'
      }).then((dataSource) => {
        this.dataSource = dataSource;
      });
    });
  }
}
