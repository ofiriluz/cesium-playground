import { EventEmitter, ViewChild, AfterViewInit, Input } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { LayersAPIService } from 'src/app/services/layers-api.service';
import { LayerSource, LayerType } from 'src/app/models/layer-source.model';
import { BaseLayer } from 'src/app/layers/base-layer';
import { EditableLayer } from 'src/app/layers/editable-layer';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GeoConverterService } from 'src/app/services/geo-convertor.service';

@Component({
  selector: 'mouse-coords',
  templateUrl: './mouse-coords.component.html',
  styleUrls: ['./mouse-coords.component.css']
})
export class MouseCoordsComponent implements OnInit, AfterViewInit {
  mouseHandler: any;
  public currentPosition = null;

  private updateCurrentPosition(click) {
    const position = Cesium.Cartographic.fromCartesian(this.appConf.getAppViewer().scene.pickPosition(click.endPosition));
    const xyzPos = {x: Cesium.Math.toDegrees(position.longitude).toFixed(5),
      y: Cesium.Math.toDegrees(position.latitude).toFixed(5),
      z: position.height.toFixed(2)};
    const fromDeg = new Cesium.Cartesian3.fromDegrees(xyzPos.x, xyzPos.y, xyzPos.z);
    this.currentPosition = {wgs: xyzPos, deg: fromDeg, itm: this.geoService.convertWGSToITM(xyzPos.y, xyzPos.x)};
  }

  constructor(private appConf: AppConfigService, private geoService: GeoConverterService) {

  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.appConf.getAppViewer().scene.canvas);
    this.mouseHandler.setInputAction((click) => {
      try {
        this.updateCurrentPosition(click);
      } catch (e) {}
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
}
