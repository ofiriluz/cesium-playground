import { BaseLayer } from 'src/app/layers/base-layer';

export interface EditableLayer extends BaseLayer {
  addEntity(entity: any);
  removeEntity(entity: any);
  invalidateEntities();
  clearEntities();
  destroyLayer();
}
