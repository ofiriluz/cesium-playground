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
import { MapBoxService } from 'src/app/services/mapbox-service';
import { OverpassService } from 'src/app/services/overpass.service';

@Component({
  selector: 'building-numbers-layer',
  templateUrl: 'building-numbers-layer.component.html'
})
export class BuildingNumbersLayerComponent implements AfterViewInit, OnInit, BaseLayer {
  Cesium = Cesium;
  showBuildingNumbers = true;
  @Input()
  buildingNumbersSource: LayerSource;
  @Input()
  buildingNumbersIndex: number;
  buildingNumbersLabelsEntity: any;

  constructor(private appConf: AppConfigService,
    private layersService: LayersAPIService,
    private mapBoxService: MapBoxService,
    private overpassService: OverpassService) {
      this.buildingNumbersLabelsEntity = null;
  }

  public getLayerMeta(): LayerSource {
    return this.buildingNumbersSource;
  }

  public getLayerEntity() {
    return this.buildingNumbersLabelsEntity;
  }

  public getLayerBounds() {
    return null;
  }

  public showLayer(): void {
    this.showBuildingNumbers = true;
    this.buildingNumbersLabelsEntity.show = true;

    this.loadBuildingNumbers();
  }

  public hideLayer(): void {
    this.showBuildingNumbers = false;
    this.buildingNumbersLabelsEntity.show = false;
    this.buildingNumbersLabelsEntity.removeAll();
  }

  public isLayerVisible(): boolean {
    return this.showBuildingNumbers;
  }

  public moveToLayer(): void {}

  private addBuildingNumberLabel(pos, number) {
    Cesium.Label.enableRightToLeftDetection = true;
    const label = this.buildingNumbersLabelsEntity.add({
      showBackground: false,
      font: '20px arial, sans-serif',
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BASELINE,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      outlineColor : Cesium.Color.BLACK,
      outlineWidth : 4.0,
      fillColor : new Cesium.Color(0.9, 0.9, 0.9, 1.0),
      position : pos,
      text : number
    });
  }

  private getCartesianFixed(street, cb) {
    const ellipsoid = this.appConf.getAppViewer().scene.globe.ellipsoid;
    const wgsPos = Cesium.Cartographic.fromDegrees(
      street.lon,
      street.lat, 5000);
      Cesium.sampleTerrain(this.appConf.getAppViewer().terrainProvider, 13, [ wgsPos ])
      .then((samples) => {
        wgsPos.height = samples[0].height;
        const cartPos = Cesium.Cartographic.toCartesian(wgsPos);
        cb(cartPos);
      });
  }

  private loadBuildingNumbers() {
    // Get the fitting rect from the bounded static layer
    const boundedLayer = this.buildingNumbersSource.layerProps['boundedLayer'];
    for (const layer of this.appConf.getLoadedLayers()) {
      if (layer.getLayerMeta().layerName === boundedLayer) {
        const bounds = layer.getLayerBounds();
        // Request the bounds from the service
        this.overpassService.getBoundryStreetsInformation(bounds).then((data) => {
          // Add each street, first go over the streets and centerize them
          for (const building of data['elements']) {
            if (!('addr:housenumber' in building['tags'])) {
              continue;
            }

            this.getCartesianFixed(building, (cartPos) => {
              this.addBuildingNumberLabel(cartPos, building['tags']['addr:housenumber']);
            });
          }
        }).catch((err) => {
          console.log(err);
        });

        break;
      }
    }
  }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.buildingNumbersLabelsEntity = this.appConf.getAppViewer().scene.primitives.add(new Cesium.LabelCollection());
    this.showBuildingNumbers = this.buildingNumbersSource.isShownAtStart;
  }
}
