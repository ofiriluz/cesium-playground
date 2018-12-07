import { LayerSource } from 'src/app/models/layer-source.model';

export interface BaseLayer {
  getLayerEntity(): any;
  getLayerMeta(): LayerSource;
  getLayerBounds(): any;
  moveToLayer(): void;
  showLayer(): void;
  hideLayer(): void;
  isLayerVisible(): boolean;
}
