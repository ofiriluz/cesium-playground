import { Injectable, EventEmitter } from '@angular/core';
import { BaseLayer } from 'src/app/layers/base-layer';

@Injectable()
export class AppConfigService {
  private viewer: any;
  private staticLayers: BaseLayer[];
  private staticLayersChanged = new EventEmitter<any>();
  constructor() {

  }

  public setAppViewer(viewer) {
    this.viewer = viewer;
  }

  public getAppViewer(): any {
    return this.viewer;
  }

  public setLoadedLayers(layers: BaseLayer[]) {
    this.staticLayers = layers;
    console.log(this.staticLayers.length);
    this.staticLayersChanged.emit();
  }

  public getLoadedLayers() {
    return this.staticLayers;
  }

  public listenToLoadedLayersChanged(cb) {
    this.staticLayersChanged.subscribe(cb);
  }
}
