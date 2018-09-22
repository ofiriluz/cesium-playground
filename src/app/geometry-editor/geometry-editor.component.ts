import { EventEmitter, ViewChild, AfterViewInit, Input } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { LayersAPIService } from 'src/app/services/layers-api.service';
import { LayerSource, LayerType } from 'src/app/models/layer-source.model';
import { BaseLayer } from 'src/app/layers/base-layer';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GeoConverterService } from 'src/app/services/geo-convertor.service';

@Component({
  selector: 'geometry-editor',
  templateUrl: './geometry-editor.component.html',
  styleUrls: ['./geometry-editor.component.css']
})
export class GeometryEditorComponent implements OnInit, AfterViewInit {
  Cesium = Cesium;
  public geometryTypes = ['Points', 'Line'];
  public geometryPick = 'None';
  public entities = [];
  @Output()
  public geometryTypeChanged = new EventEmitter<string>();
  @Output()
  public entityAdded = new EventEmitter<any>();
  @Output()
  public layerSaved = new EventEmitter<any>();
  public layerReset = new EventEmitter<any>();

  cesiumSelectionHandler: any;

  constructor(private appConf: AppConfigService, private geoService: GeoConverterService) {
    this.cesiumSelectionHandler = null;
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {

  }

  public onLayerSave() {
    this.layerSaved.emit();
  }

  public onLayerReset() {
    this.layerReset.emit();
  }

  public onGeomTypeChanged(type) {
    if (this.cesiumSelectionHandler !== null) {
      this.cesiumSelectionHandler.destroy();
    }
    this.cesiumSelectionHandler = new Cesium.ScreenSpaceEventHandler(this.appConf.getAppViewer().scene.canvas);
    this.cesiumSelectionHandler.setInputAction((click) => {
      const position = Cesium.Cartographic.fromCartesian(this.appConf.getAppViewer().scene.pickPosition(click.position));
      const xyzPos = {x: Cesium.Math.toDegrees(position.longitude).toFixed(5),
                    y: Cesium.Math.toDegrees(position.latitude).toFixed(5),
                    z: position.height.toFixed(2)};
      const fromDeg = new Cesium.Cartesian3.fromDegrees(xyzPos.x, xyzPos.y, xyzPos.z);
      this.entityAdded.emit(fromDeg);
      this.entities.push({xyz: xyzPos, deg: fromDeg, wgs: this.geoService.convertWGSToITM(xyzPos.y, xyzPos.x)});
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.geometryTypeChanged.emit(type.value);
  }
}
