import { EventEmitter, ViewChild, AfterViewInit, ViewChildren, QueryList, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import {
  ActionType,
  AcNotification,
  AcLayerComponent,
  SceneMode,
  MapLayerProviderOptions,
  ViewerConfiguration
} from 'angular-cesium';
import { Observable, Subscriber } from 'rxjs';
import { LayersAPIService } from 'src/app/services/layers-api.service';
import { LayerSource, LayerType } from 'src/app/models/layer-source.model';
import { BaseLayer } from 'src/app/layers/base-layer';
import { PointsLayerComponent } from 'src/app/layers/points-layer/points-layer.component';
import { EditableLayer } from 'src/app/layers/editable-layer';
import { PolylineLayerComponent } from 'src/app/layers/polyline-layer/polyline-layer.component';
import { AppConfigService } from 'src/app/services/app-config.service';
import { saveAs } from 'file-saver';

declare var jquery: any;
declare var $: any;

export enum DisplayShadowMode {
  NONE,
  MODELS,
  WORLD
}

@Component({
  selector: 'cesium-viewer',
  templateUrl: './cesium-viewer.component.html',
  styleUrls: ['./cesium-viewer.component.css']
})
export class CesiumViewerComponent implements OnInit, AfterViewInit {
  DisplayShadowMode = DisplayShadowMode;
  public layerSources: LayerSource[];
  public LayerType = LayerType;
  @ViewChild('mapLayer')
  mapLayer: BaseLayer;
  @ViewChildren('layerComp')
  staticLayers: QueryList<BaseLayer>;
  editableLayers: Array<EditableLayer>;
  public showLayersList = false;
  public showGeometryEditor = false;
  editedLayer: EditableLayer;
  currShadowMode = DisplayShadowMode.NONE;

  constructor(private layersService: LayersAPIService,
              private appConf: AppConfigService,
              private factoryResolve: ComponentFactoryResolver,
              private viewContainerRef: ViewContainerRef) {
    this.staticLayers = new QueryList<BaseLayer>();
    this.editableLayers = new Array<EditableLayer>();
  }

  ngAfterViewInit(): void {
    this.goToHome();
  }

  ngOnInit(): void {
    // Load the layer sources from the server
    this.layersService.getLayersMeta().toPromise().then((layersData) => {
      this.layerSources = layersData['layers'] as LayerSource[];
      console.log(this.layerSources);
      console.log(LayerType);
    });
    this.goToHome();
  }

  private getComponentFactory(type: string) {
    if (type === 'Points') {
      return this.factoryResolve.resolveComponentFactory(PointsLayerComponent);
    } else if (type === 'Polyline') {
      return this.factoryResolve.resolveComponentFactory(PolylineLayerComponent);
    }
  }

  private handlePostCreation(component, type) {
    if (type === 'Points') {
      component.instance.pointsSource = new LayerSource();
      component.instance.pointsSource.layerName = 'Points Layer';
      component.instance.pointsSource.layerPath = '';
      component.instance.pointsSource.layerType = LayerType.POINTS;
      component.instance.pointsSource.layerProps = {};
    } else if (type === 'Polyline') {
      component.instance.polylineSource = new LayerSource();
      component.instance.polylineSource.layerName = 'Polyline Layer';
      component.instance.polylineSource.layerPath = '';
      component.instance.polylineSource.layerType = LayerType.POLYLINE;
      component.instance.polylineSource.layerProps = {};
    }
  }

  public checkLayerName(value: string): boolean {
    for (let i = 0; i < this.editableLayers.length; i++) {
      if (this.editableLayers[i].getLayerMeta().layerName === value) {
        return false;
      }
    }
    return true;
  }

  public onGeometryTypeChanged(type: string) {
    const factory = this.getComponentFactory(type);
    const component = factory.create(this.viewContainerRef.parentInjector);
    this.viewContainerRef.insert(component.hostView);
    this.handlePostCreation(component, type);
    this.editedLayer = component.instance as EditableLayer;
  }

  public onEntityAdded(entity: any) {
    this.editedLayer.addEntity(entity);
  }

  public onLayerSaved(layerName: string) {
    this.editedLayer.getLayerMeta().layerName = layerName;
    this.editableLayers.push(this.editedLayer);
    this.editedLayer = null;
  }

  public onLayerReset() {
    this.editedLayer.clearEntities();
  }

  public onEditableLayerRemoval(layerIndex: number) {
    this.editableLayers[layerIndex].clearEntities();
    this.editableLayers.splice(layerIndex, 1);
  }

  public takeScreenshot() {
    $('.modal').modal('show');
    const canvas = this.appConf.getAppViewer().scene.canvas;
    this.appConf.getAppViewer().render();

    canvas.toBlob((blob) => {
      const currDate = new Date();
      saveAs(blob, 'Screenshot-' + currDate.getHours() + '-' + currDate.getMinutes() + '-' + currDate.getSeconds() + '.png');
      $('.modal').modal('hide');
    });
  }

  public updateShadows() {
    if (this.currShadowMode === DisplayShadowMode.NONE) {
      this.appConf.getAppViewer().shadows = true;
      this.appConf.getAppViewer().terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY;
      this.currShadowMode = DisplayShadowMode.MODELS;
    } else if (this.currShadowMode === DisplayShadowMode.MODELS) {
      this.appConf.getAppViewer().terrainShadows = Cesium.ShadowMode.ENABLED;
      this.currShadowMode = DisplayShadowMode.WORLD;
    } else {
      this.appConf.getAppViewer().shadows = false;
      this.currShadowMode = DisplayShadowMode.NONE;
    }
  }

  public goToHome() {
    // TEMP
    const p = Cesium.Cartesian3.fromDegrees(34.7690232509, 32.0635270695, 300);
    this.appConf.getAppViewer().camera.flyTo({
      destination: p
    });
    // const p = Cesium.Cartesian3.fromDegrees(34.91543, 32.49100, 62.91294144);
    // const ori = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(180.0), Cesium.Math.toRadians(-20.0), Cesium.Math.toRadians(0.0));

    // this.appConf.getAppViewer().camera.flyTo({
    //   destination: p,
    //   orientation: ori
    // });
  }
}
