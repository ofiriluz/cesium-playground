import { LayerSource } from "src/app/models/layer-source.model";

export interface BaseLayer {
  getLayerEntity(): any;
  getLayerMeta(): LayerSource;
  moveToLayer(): void;
  showLayer(): void;
  hideLayer(): void;
}
