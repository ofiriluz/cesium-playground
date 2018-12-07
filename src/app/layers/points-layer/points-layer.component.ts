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
import { GeoConverterService } from 'src/app/services/geo-convertor.service';

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
  pointLabelsEntity: any;
  pointPositions: any[];
  pointLabelIndices: any[];
  moveHandler: any;

  constructor(private appConf: AppConfigService, private geoService: GeoConverterService) {
    this.pointEntity = null;
    this.pointPositions = [];
    this.pointLabelIndices = [];
    this.pointLabelsEntity = null;
  }

  public getLayerMeta(): LayerSource {
    return this.pointsSource;
  }

  public getLayerEntity() {
    return this.pointEntity;
  }

  public getLayerBounds() {
    return null;
  }

  public showLayer(): void {
    this.pointEntity.show = true;
    this.pointLabelsEntity.show = true;
    this.showPoints = true;
    this.invalidateEntities();
  }

  public hideLayer(): void {
    this.pointEntity.show = false;
    this.pointLabelsEntity.show = false;
    this.showPoints = false;
    this.pointEntity.removeAll();
    this.pointLabelsEntity.removeAll();
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

  public addEntity(entity: any) {
    this.pointPositions.push(entity);
    this.invalidateEntities();
  }

  public removeEntity(entity: any) {
    for (let i = 0; i < this.pointPositions.length; i++) {
      if (this.pointPositions[i] === entity) {
        this.pointPositions.splice(i, 1);
        break;
      }
    }
    this.invalidateEntities();
  }

  public invalidateEntities() {
    this.pointEntity.removeAll();
    this.pointLabelsEntity.removeAll();

    for (let i = 0; i < this.pointPositions.length; i++) {
      this.pointEntity.add(new Cesium.PointPrimitive({
        position: this.pointPositions[i],
        pixelSize: 10,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 2
      }));
    }

    // Add Labels
    for (const index of this.pointLabelIndices) {
      this.addPointLabel(index);
    }
  }

  private addPointLabel(index: number): void {
    const position = this.pointPositions[this.pointLabelIndices[index]];
    const radwgsPos = Cesium.Cartographic.fromCartesian(position);
    const degwgsPos = {x: Cesium.Math.toDegrees(radwgsPos.longitude),
                  y: Cesium.Math.toDegrees(radwgsPos.latitude),
                  z: radwgsPos.height};
    const itm = this.geoService.convertWGSToITM(degwgsPos.y, degwgsPos.x);
    Cesium.Label.enableRightToLeftDetection = true;
    const label = this.pointLabelsEntity.add({
      showBackground: true,
      font: '16px arial, sans-serif',
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BASELINE,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      outlineColor : Cesium.Color.BLACK,
      outlineWidth : 2.0,
      backgroundColor : new Cesium.Color(0.8, 0.8, 0.0, 0.65),
      fillColor : new Cesium.Color(0.0, 0.0, 0.9, 1.0),
      position : position,
      text : 'נקודה מספר : ' + (index + 1) + '/' + this.pointPositions.length + '\n' +
             'רשת ישראל החדשה : ' + itm.E.toFixed(2) + ', ' + itm.N.toFixed(2) + ', ' + position.z.toFixed(2) + '\n' +
             'מערכת גאודטית עולמית : ' + degwgsPos.x.toFixed(5) + ', ' + degwgsPos.y.toFixed(5) + ', ' + degwgsPos.z.toFixed(2)
    });
  }

  public clearEntities() {
    this.appConf.getAppViewer().scene.primitives.remove(this.pointEntity);
    this.pointEntity = null;
    this.pointLabelIndices = [];
    this.pointPositions = [];
    this.pointLabelsEntity = null;
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
      this.pointEntity = this.appConf.getAppViewer().scene.primitives.add(new Cesium.PointPrimitiveCollection());
      this.pointLabelsEntity = this.appConf.getAppViewer().scene.primitives.add(new Cesium.LabelCollection());

      this.moveHandler = new Cesium.ScreenSpaceEventHandler(this.appConf.getAppViewer().scene.canvas);
      this.moveHandler.setInputAction((move) => {
        // Check if the mouse is under a point, if so, show the point label
        // Convert to cartesian
        const cartPos = new Cesium.Cartesian3();
        this.appConf.getAppViewer().scene.pickPosition(move.endPosition, cartPos);

        // Go over the existing points and check if a point exists
        this.pointLabelIndices = [];
        for (let i = 0; i < this.pointPositions.length; i++) {
          const distance = Cesium.Cartesian3.distance(cartPos, this.pointPositions[i]);
          // Epsilon
          if (distance < 2.0) {
            // Found point, add it to the shownPoints indices list
            this.pointLabelIndices.push(i);
          }
        }

        this.invalidateEntities();
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      if (this.pointsSource !== undefined
        && Object.prototype.hasOwnProperty.call(this.pointsSource.layerProps, 'points')) {
      this.pointsSource.layerProps['points'].forEach(point => {
        this.addEntity(point);
      });
    }
  }
}
