export enum LayerType {
  TILE,
  KML,
  SHP
}

export class LayerSource {
  public layerPath: string;
  public layerIndex: number;
  public layerType: LayerType;
  public layerName: string;
}
