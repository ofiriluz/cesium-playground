import { EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
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

@Component({
  selector: 'cesium-viewer',
  templateUrl: './cesium-viewer.component.html',
  styleUrls: ['./cesium-viewer.component.css']
})
export class CesiumViewerComponent implements OnInit, AfterViewInit {
  public layerSources: LayerSource[];
  public LayerType = LayerType;

  constructor(private layersService: LayersAPIService) {

  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {
    // Load the layer sources from the server
    this.layersService.getLayersMeta().toPromise().then((layersData) => {
      this.layerSources = layersData as LayerSource[];
    });
  }
}
