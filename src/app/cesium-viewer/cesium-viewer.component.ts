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

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'cesium-viewer',
  templateUrl: './cesium-viewer.component.html',
  styleUrls: ['./cesium-viewer.component.css']
})
export class CesiumViewerComponent implements OnInit, AfterViewInit {
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

  constructor(private layersService: LayersAPIService,
              private factoryResolve: ComponentFactoryResolver,
              private viewContainerRef: ViewContainerRef) {
    this.staticLayers = new QueryList<BaseLayer>();
    this.editableLayers = new Array<EditableLayer>();
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    // Load the layer sources from the server
    this.layersService.getLayersMeta().toPromise().then((layersData) => {
      this.layerSources = layersData['layers'] as LayerSource[];
    });
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
  }

  public onLayerReset() {
    this.editedLayer.clearEntities();
  }
}
