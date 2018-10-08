import { EventEmitter, ViewChild, AfterViewInit, Input, ElementRef } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { LayersAPIService } from 'src/app/services/layers-api.service';
import { LayerSource, LayerType } from 'src/app/models/layer-source.model';
import { BaseLayer } from 'src/app/layers/base-layer';
import { AppConfigService } from 'src/app/services/app-config.service';
import { GeoConverterService } from 'src/app/services/geo-convertor.service';
import { ErrorStateMatcher } from '@angular/material';
import { FormControl, NgForm, FormGroupDirective, Validators } from '@angular/forms';

export class LayerNameErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'geometry-editor',
  templateUrl: './geometry-editor.component.html',
  styleUrls: ['./geometry-editor.component.css']
})
export class GeometryEditorComponent implements OnInit, AfterViewInit {
  Cesium = Cesium;
  public geometryTypes = ['נקודות', 'מצולע פתוח'];
  public geometryPick = 'לא נבחר';
  public entities = [];
  @Output()
  public geometryTypeChanged = new EventEmitter<string>();
  @Output()
  public entityAdded = new EventEmitter<any>();
  @Output()
  public layerSaved = new EventEmitter<any>();
  @Output()
  public layerReset = new EventEmitter<any>();
  @Input()
  public isLayerNameValid: (value: string) => boolean;
  public layerName = '';
  public layerSavedToViewer = false;
  public layerNameExists = false;
  @Input()
  public isEditorEnabled: boolean;
  layerType = '';

  matcher = new LayerNameErrorStateMatcher();
  layerNameFormControl = new FormControl('', [
    Validators.required
  ]);

  cesiumSelectionHandler: any;

  constructor(private appConf: AppConfigService, private geoService: GeoConverterService) {
    this.cesiumSelectionHandler = null;
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {}

  public updateLayerName(event: any) {
    this.layerName = event.target.value;
  }

  public onLayerSave() {
    if (this.layerName.trim() === '') {
      return;
    }

    if (this.isLayerNameValid !== undefined) {
      if (!this.isLayerNameValid(this.layerName)) {
        this.layerNameExists = true;
        return;
      }
    }

    this.layerNameExists = false;
    this.layerSaved.emit(this.layerName.trim());
    this.entities = [];
    this.layerSavedToViewer = true;
    this.geometryTypeChanged.emit(this.layerType);
  }

  public onLayerReset() {
    this.layerNameExists = false;
    this.layerReset.emit();
    this.entities = [];
    this.layerSavedToViewer = false;
  }

  public onGeomTypeChanged(type) {
    if (this.cesiumSelectionHandler !== null) {
      this.cesiumSelectionHandler.destroy();
      this.onLayerReset();
    }
    this.cesiumSelectionHandler = new Cesium.ScreenSpaceEventHandler(this.appConf.getAppViewer().scene.canvas);
    this.cesiumSelectionHandler.setInputAction((click) => {
      if (!this.isEditorEnabled) {
        return;
      }

      const cartPos = new Cesium.Cartesian3();
      this.appConf.getAppViewer().scene.pickPosition(click.position, cartPos);
      const radwgsPos = Cesium.Cartographic.fromCartesian(cartPos);

      const degwgsPos = {x: Cesium.Math.toDegrees(radwgsPos.longitude),
                    y: Cesium.Math.toDegrees(radwgsPos.latitude),
                    z: radwgsPos.height};

      this.entities.push({wgs: degwgsPos, cart: cartPos, itm: this.geoService.convertWGSToITM(degwgsPos.y, degwgsPos.x)});

      // This is to resolve clipping issue with map / tiles
      // const translatedWgs = radwgsPos;
      // translatedWgs.height += 0.75;
      this.entityAdded.emit(Cesium.Cartographic.toCartesian(radwgsPos));

      this.layerSavedToViewer = false;
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.geometryTypeChanged.emit(type.value);
    this.layerType = type.value;
  }
}
