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
  polylinePointsEntity: any;
  moveHandler: any;

  constructor(private appConf: AppConfigService) {
    this.polylinePositions = [];
    this.polylineEntity = null;
    this.polylinePointsEntity = null;
  }

  public getLayerMeta(): LayerSource {
    return this.polylineSource;
  }

  public getLayerEntity() {
    return this.polylineEntity;
  }

  public showLayer(): void {
    this.polylineEntity.show = true;
    this.polylinePointsEntity.show = true;
    this.invalidateEntity();
    this.showPolyline = true;
  }

  public hideLayer(): void {
    this.polylineEntity.show = false;
    this.polylinePointsEntity.show = false;
    this.polylineEntity.removeAll();
    this.polylinePointsEntity.removeAll();
    this.showPolyline = false;
  }

  public isLayerVisible(): boolean {
    return this.showPolyline;
  }

  public moveToLayer(): void {
    // Calculate the center of all the polyline points
    const center = {x: 0, y: 0, z: 0};
    this.polylinePositions.forEach(element => {
      center.x += element.x;
      center.y += element.y;
      center.z += element.z;
    });

    center.x /= this.polylinePositions.length;
    center.y /= this.polylinePositions.length;
    center.z /= this.polylinePositions.length;

    this.appConf.getAppViewer().flyTo(center);
  }

  addEntity(entity: any) {
    console.log('hi');
    this.polylinePositions.push(entity);
    this.invalidateEntity();
  }

  removeEntity(entity: any) {
    for (let i = 0; i < this.polylinePositions.length; i++) {
      if (this.polylinePositions[i] === entity) {
        this.polylinePositions.splice(i, 1);
        break;
      }
    }
  }
  clearEntities() {
    this.appConf.getAppViewer().scene.primitives.remove(this.polylineEntity);
    this.appConf.getAppViewer().scene.primitives.remove(this.polylinePointsEntity);
    this.polylineEntity = null;
    this.polylinePointsEntity = null;
    this.polylinePositions = [];
  }

  invalidateEntity() {
    this.polylineEntity.removeAll();
    this.polylinePointsEntity.removeAll();

    for (let i = 0; i < this.polylinePositions.length; i++) {
      console.log(this.polylinePositions[i]);
      this.polylinePointsEntity.add(new Cesium.PointPrimitive({
        position: this.polylinePositions[i],
        pixelSize: 10,
        color: Cesium.Color.BLUE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        scaleByDistance : new Cesium.NearFarScalar(1.5e2, 1.25, 1.5e7, 0.5),
        translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.2)
      }));

      if (i >= 1) {
        this.polylineEntity.add({
          positions: [this.polylinePositions[i - 1], this.polylinePositions[i]],
          color: Cesium.Color.WHITE,
          width: 3
        });
      }
    }
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    this.polylinePointsEntity = this.appConf.getAppViewer().scene.primitives.add(new Cesium.PointPrimitiveCollection());
    this.polylineEntity = this.appConf.getAppViewer().scene.primitives.add(new Cesium.PolylineCollection());

    this.moveHandler = new Cesium.ScreenSpaceEventHandler(this.appConf.getAppViewer().scene.canvas);
    this.moveHandler.setInputAction((click) => {
      this.invalidateEntity();
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    if (this.polylineSource !== undefined && Object.prototype.hasOwnProperty.call(this.polylineSource.layerProps, 'points')) {
      this.polylineSource.layerProps['points'].forEach(point => {
        this.addEntity(point);
      });
    }
  }
}
