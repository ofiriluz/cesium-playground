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

  private getComponentByType(type: string) {
    if (type === 'Points') {
      return PointsLayerComponent;
    } else if (type === 'Polygon') {
      // TODO
    }
  }

  private handlePostCreation(component, type) {
    if (type === 'Points') {
      component.instance.pointsSource = new LayerSource();
      component.instance.pointsSource.layerName = 'Points Layer';
      component.instance.pointsSource.layerPath = '';
      component.instance.pointsSource.layerType = LayerType.POINTS;
      component.instance.pointsSource.layerProps = {};
    } else if (type === 'Polygon') {
      // TODO
    }
  }

  public onGeometryTypeChanged(type: string) {
    const componentType = this.getComponentByType(type);
    const factory = this.factoryResolve.resolveComponentFactory(componentType);
    const component = factory.create(this.viewContainerRef.parentInjector);
    this.viewContainerRef.insert(component.hostView);
    this.handlePostCreation(component, type);
    this.editedLayer = component.instance as EditableLayer;
  }

  public onEntityAdded(entity: any) {
    this.editedLayer.addEntity(entity);
  }

  public onLayerSaved() {
    this.editableLayers.push(this.editedLayer);
  }

  public onLayerReset() {
    this.editedLayer.clearEntities();
  }
}
