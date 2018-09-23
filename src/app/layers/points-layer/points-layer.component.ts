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
import { EditableLayer } from 'src/app/layers/editable-layer';

@Component({
  selector: 'points-layer',
  templateUrl: 'points-layer.component.html'
})
export class PointsLayerComponent implements AfterViewInit, OnInit, EditableLayer {
  Cesium = Cesium;
  showPoints = true;
  @Input()
  pointsSource: LayerSource;
  pointEntities: any[];

  constructor(private appConf: AppConfigService) {
    this.pointEntities = [];
  }

  public getLayerMeta(): LayerSource {
    return this.pointsSource;
  }

  public getLayerEntity() {
    return this.pointEntities;
  }

  public showLayer(): void {
    this.pointEntities.forEach(entity => {
      entity.show = true;
    });
    this.showPoints = true;
  }

  public hideLayer(): void {
    this.pointEntities.forEach(entity => {
      entity.show = false;
    });
    this.showPoints = false;
  }

  public isLayerVisible(): boolean {
    return this.showPoints;
  }

  public moveToLayer(): void {
    // TODO
    // this.appConf.getAppViewer().flyTo(this.pointEntity);
  }

  addEntity(entity: any) {
    this.pointEntities.push(this.appConf.getAppViewer().entities.add({
      position: entity,
      point: {
        pixelSize : 15,
        color : Cesium.Color.PURPLE,
        outlineColor : Cesium.Color.BLACK,
        outlineWidth : 2
      }
    }));
  }
  removeEntity(entity: any) {
    // TODO
  }
  clearEntities() {
    // TODO
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
      console.log(this.pointsSource);
      if (this.pointsSource !== undefined
        && Object.prototype.hasOwnProperty.call(this.pointsSource.layerProps, 'points')) {
      this.pointsSource.layerProps['points'].forEach(point => {
        this.addEntity(point);
      });
    }
  }
}
