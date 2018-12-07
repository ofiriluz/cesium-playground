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
  selector: 'streets-layer',
  templateUrl: 'streets-layer.component.html'
})
export class StreetsLayerComponent implements AfterViewInit, OnInit, BaseLayer {
  Cesium = Cesium;
  showStreets = true;
  @Input()
  streetsSource: LayerSource;
  @Input()
  streetsIndex: number;
  streetsLabelsEntity: any;

  constructor(private appConf: AppConfigService,
    private layersService: LayersAPIService,
    private mapBoxService: MapBoxService,
    private overpassService: OverpassService) {
      this.streetsLabelsEntity = null;
  }

  public getLayerMeta(): LayerSource {
    return this.streetsSource;
  }

  public getLayerEntity() {
    return this.streetsLabelsEntity;
  }

  public getLayerBounds() {
    return null;
  }

  public showLayer(): void {
    this.showStreets = true;
    this.streetsLabelsEntity.show = true;

    this.loadStreets();
  }

  public hideLayer(): void {
    this.showStreets = false;
    this.streetsLabelsEntity.show = false;
    this.streetsLabelsEntity.removeAll();
  }

  public isLayerVisible(): boolean {
    return this.showStreets;
  }

  public moveToLayer(): void {}

  private addStreetLabel(pos, name) {
    Cesium.Label.enableRightToLeftDetection = true;
    const label = this.streetsLabelsEntity.add({
      showBackground: true,
      font: '18px arial, sans-serif',
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BASELINE,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      outlineColor : Cesium.Color.BLACK,
      outlineWidth : 3.0,
      fillColor : new Cesium.Color(0.4, 0.4, 0.4, 0.9),
      backgroundColor: new Cesium.Color(0.9, 0.9, 0.9, 0.75),
      position : pos,
      text : name,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE
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

  private loadStreets() {
    // Get the fitting rect from the bounded static layer
    const boundedLayer = this.streetsSource.layerProps['boundedLayer'];
    for (const layer of this.appConf.getLoadedLayers()) {
      if (layer.getLayerMeta().layerName === boundedLayer) {
        const bounds = layer.getLayerBounds();
        // Request the bounds from the service
        this.overpassService.getBoundryStreetsInformation(bounds).then((data) => {
          // Add each street, first go over the streets and centerize them
          const streets = {};
          for (const street of data['elements']) {
            let ignore = false;
            for (const key in street['tags']) {
              if (key !== 'addr:housenumber' && key !== 'addr:street' && key !== 'source') {
                ignore = true;
                break;
              }
            }
            if (ignore) {
              continue;
            }

            const name = street['tags']['addr:street'];
            if (!(name in streets)) {
              streets[name] = {
                name: name,
                lat: street['lat'],
                lon: street['lon'],
                count: 1
              };
            } else {
              streets[name].lat = ((streets[name].lat * streets[name].count) + street['lat']) / (streets[name].count + 1);
              streets[name].lon = ((streets[name].lon * streets[name].count) + street['lon']) / (streets[name].count + 1);
              streets[name].count = streets[name].count + 1;
            }
          }

          // Add the labels
          Object.keys(streets).forEach((street) => {
            this.getCartesianFixed(streets[street], (cartPos) => {
              this.addStreetLabel(cartPos, street);
            });
          });
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
    this.streetsLabelsEntity = this.appConf.getAppViewer().scene.primitives.add(new Cesium.LabelCollection());
    this.showStreets = this.streetsSource.isShownAtStart;
  }
}
