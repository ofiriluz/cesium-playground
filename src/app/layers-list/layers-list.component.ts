import { EventEmitter, ViewChild, AfterViewInit, Input } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { LayersAPIService } from 'src/app/services/layers-api.service';
import { LayerSource, LayerType } from 'src/app/models/layer-source.model';
import { BaseLayer } from 'src/app/layers/base-layer';
import { EditableLayer } from 'src/app/layers/editable-layer';

@Component({
  selector: 'layers-list',
  templateUrl: './layers-list.component.html',
  styleUrls: ['./layers-list.component.css']
})
export class LayersListComponent implements OnInit, AfterViewInit {
  @Input()
  public staticLayers: BaseLayer[];
  @Input()
  public editableLayers: EditableLayer[];
  @Output()
  public removeLayer = new EventEmitter<EditableLayer>();

  constructor() {

  }

  public updateLayerVisbility(layer: BaseLayer) {
    layer.isLayerVisible() ? layer.hideLayer() : layer.showLayer();
  }

  public onRemoveLayer(layer: EditableLayer) {
    this.removeLayer.emit(layer);
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {}
}
