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
  selector: 'polyline-layer',
  templateUrl: 'polyline-layer.component.html'
})
export class PolylineLayerComponent implements AfterViewInit, OnInit, EditableLayer {
  Cesium = Cesium;
  showPolyline = true;
  @Input()
  polylineSource: LayerSource;
  polylinePositions: any[];
  polylineEntity: any;

  constructor(private appConf: AppConfigService) {
    this.polylinePositions = [];
    this.polylineEntity = null;
  }

  public getLayerMeta(): LayerSource {
    return this.polylineSource;
  }

  public getLayerEntity() {
    return this.polylineEntity;
  }

  public showLayer(): void {
    this.polylineEntity.show = true;
    this.showPolyline = true;
  }

  public hideLayer(): void {
    this.polylineEntity.show = false;
    this.showPolyline = false;
  }

  public isLayerVisible(): boolean {
    return this.showPolyline;
  }

  public moveToLayer(): void {
    // TODO
    // this.appConf.getAppViewer().flyTo(this.pointEntity);
  }

  addEntity(entity: any) {
    if (this.polylinePositions.length === 0) {
      this.polylinePositions.push(entity);
      return;
    }
    this.polylinePositions.push(entity);
    if (this.polylineEntity === null) {
      this.polylineEntity = this.appConf.getAppViewer().entities.add({
        polyline: {
          positions: [this.polylinePositions[this.polylinePositions.length - 2], entity],
          width: 5,
          material: Cesium.Color.RED
        }
      });
    } else {
      this.polylineEntity.polyline.positions = this.polylinePositions;
    }
  }

  removeEntity(entity: any) {
    // TODO
  }
  clearEntities() {
    // TODO
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    if (this.polylineSource !== undefined && Object.prototype.hasOwnProperty.call(this.polylineSource.layerProps, 'points')) {
      this.polylineSource.layerProps['points'].forEach(point => {
        this.addEntity(point);
      });
    }
  }
}
