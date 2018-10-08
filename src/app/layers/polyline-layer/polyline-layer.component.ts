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
  polylineLabelsEntity: any;
  polylinePointsLabelsIndices: Array<number>;
  polylinePointsEntity: any;
  moveHandler: any;

  constructor(private appConf: AppConfigService, private geoService: GeoConverterService) {
    this.polylinePositions = [];
    this.polylineEntity = null;
    this.polylinePointsEntity = null;
    this.polylineLabelsEntity = null;
    this.polylinePointsLabelsIndices = [];
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
    this.polylineLabelsEntity.removeAll();
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
    this.appConf.getAppViewer().scene.primitives.remove(this.polylineLabelsEntity);
    this.polylineEntity = null;
    this.polylinePointsEntity = null;
    this.polylineLabelsEntity = null;
    this.polylinePointsLabelsIndices = [];
    this.polylinePositions = [];
  }

  invalidateEntity() {
    this.polylineEntity.removeAll();
    this.polylinePointsEntity.removeAll();
    this.polylineLabelsEntity.removeAll();

    let lastPoint = null;
    for (let i = 0; i < this.polylinePositions.length; i++) {
      const point = this.polylinePointsEntity.add(new Cesium.PointPrimitive({
        position: this.polylinePositions[i],
        pixelSize: 10,
        color: Cesium.Color.BLUE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        scaleByDistance : new Cesium.NearFarScalar(1.5e2, 1.25, 1.5e7, 0.5),
        translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.2)
      }));

      if (i >= 1) {
        // Add the line
        const line = this.polylineEntity.add({
          positions: [this.polylinePositions[i - 1], this.polylinePositions[i]],
          color: Cesium.Color.WHITE,
          width: 3
        });

        // Add the label
        Cesium.Label.enableRightToLeftDetection = true;
        const label = this.polylineLabelsEntity.add({
          showBackground: true,
          font: '16px arial, sans-serif',
          horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
          verticalOrigin: Cesium.VerticalOrigin.BASELINE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          outlineColor : Cesium.Color.BLACK,
          outlineWidth : 1.0,
          backgroundColor : new Cesium.Color(0.165, 0.165, 0.165, 0.65)
        });
        label.del = { line: line, first: lastPoint, second: point };
        label.position = Cesium.Cartesian3.lerp(lastPoint.position, point.position, 0.5, new Cesium.Cartesian3());

        const pointsDistance = Cesium.Cartesian3.distance(lastPoint.position, point.position);
        const p1Carto = Cesium.Cartographic.fromCartesian(
          lastPoint.position,
          Cesium.Ellipsoid.WGS84,
          new Cesium.Cartographic()
        );
        const p2Carto = Cesium.Cartographic.fromCartesian(
            point.position,
            Cesium.Ellipsoid.WGS84,
            new Cesium.Cartographic()
        );
        const length = p1Carto.height - p2Carto.height;
        const horDistance = Math.sqrt(pointsDistance * pointsDistance - length * length);
        label.text = 'מרחק : ' + pointsDistance.toFixed(2) + ' מ\'\n';
        label.text += 'הפרש גובה : ' + Math.abs(length).toFixed(2) + ' מ\'\n';
        label.text += 'מרחק אופקי : ' + horDistance.toFixed(2) + ' מ\'';
      }

      lastPoint = point;
    }

    // Go over the hovered points
    for (let i = 0; i < this.polylinePointsLabelsIndices.length; i++) {
      const position = this.polylinePositions[this.polylinePointsLabelsIndices[i]];
      const radwgsPos = Cesium.Cartographic.fromCartesian(position);
      const degwgsPos = {x: Cesium.Math.toDegrees(radwgsPos.longitude),
                    y: Cesium.Math.toDegrees(radwgsPos.latitude),
                    z: radwgsPos.height};
      const itm = this.geoService.convertWGSToITM(degwgsPos.y, degwgsPos.x);
      Cesium.Label.enableRightToLeftDetection = true;
      const label = this.polylineLabelsEntity.add({
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
        text : 'נקודה מספר : ' + this.polylinePointsLabelsIndices[i] + 1 + '/' + this.polylinePositions.length + '\n' +
               'רשת ישראל החדשה : ' + itm.E.toFixed(2) + ', ' + itm.N.toFixed(2) + ', ' + position.z.toFixed(2) + '\n' +
               'מערכת גאודטית עולמית : ' + degwgsPos.x.toFixed(5) + ', ' + degwgsPos.y.toFixed(5) + ', ' + degwgsPos.z.toFixed(2)
      });
    }
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    this.polylinePointsEntity = this.appConf.getAppViewer().scene.primitives.add(new Cesium.PointPrimitiveCollection());
    this.polylineEntity = this.appConf.getAppViewer().scene.primitives.add(new Cesium.PolylineCollection());
    this.polylineLabelsEntity = this.appConf.getAppViewer().scene.primitives.add(new Cesium.LabelCollection());

    this.moveHandler = new Cesium.ScreenSpaceEventHandler(this.appConf.getAppViewer().scene.canvas);
    this.moveHandler.setInputAction((move) => {
      // Check if the mouse is under a point, if so, show the point label
      // Convert to cartesian
      const cartPos = new Cesium.Cartesian3();
      this.appConf.getAppViewer().scene.pickPosition(move.endPosition, cartPos);

      // Go over the existing points and check if a point exists
      this.polylinePointsLabelsIndices = [];
      for (let i = 0; i < this.polylinePositions.length; i++) {
        const distance = Cesium.Cartesian3.distance(cartPos, this.polylinePositions[i]);
        // Epsilon
        if (distance < 2.0) {
          // Found point, add it to the shownPoints indices list
          this.polylinePointsLabelsIndices.push(i);
        }
      }

      this.invalidateEntity();
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    if (this.polylineSource !== undefined && Object.prototype.hasOwnProperty.call(this.polylineSource.layerProps, 'points')) {
      this.polylineSource.layerProps['points'].forEach(point => {
        this.addEntity(point);
      });
    }
  }
}
