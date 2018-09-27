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
  pointEntity: any;

  constructor(private appConf: AppConfigService) {
    this.pointEntity = null;
  }

  public getLayerMeta(): LayerSource {
    return this.pointsSource;
  }

  public getLayerEntity() {
    return this.pointEntity;
  }

  public showLayer(): void {
    this.pointEntity.show = true;
    this.showPoints = true;
  }

  public hideLayer(): void {
    this.pointEntity.show = false;
    this.showPoints = false;
  }

  public isLayerVisible(): boolean {
    return this.showPoints;
  }

  public moveToLayer(): void {
    // Calculate the center of all the polyline points
    const center = {x: 0, y: 0, z: 0};
    this.pointEntity.positions.forEach(element => {
      center.x += element.position.x;
      center.y += element.position.y;
      center.z += element.position.z;
    });

    center.x /= this.pointEntity.positions.length;
    center.y /= this.pointEntity.positions.length;
    center.z /= this.pointEntity.positions.length;

    this.appConf.getAppViewer().flyTo(center);
  }

  addEntity(entity: any) {
    this.pointEntity.add(new Cesium.PointPrimitive({
      position: entity,
      pixelSize: 10,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 2
    }));
  }
  removeEntity(entity: any) {
    this.pointEntity.remove(entity);
  }
  clearEntities() {
    this.appConf.getAppViewer().scene.primitives.remove(this.pointEntity);
    this.pointEntity = null;
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
      this.pointEntity = this.appConf.getAppViewer().scene.primitives.add(new Cesium.PointPrimitiveCollection());
      if (this.pointsSource !== undefined
        && Object.prototype.hasOwnProperty.call(this.pointsSource.layerProps, 'points')) {
      this.pointsSource.layerProps['points'].forEach(point => {
        this.addEntity(point);
      });
    }
  }
}
