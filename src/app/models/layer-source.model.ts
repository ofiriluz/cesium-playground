export enum LayerType {
  TILE,
  KML,
  SHP,
  MAP,
  POINTS
}

export class LayerSource {
  public layerPath: string;
  public layerIndex: number;
  public layerType: LayerType;
  public layerName: string;
  public layerProps: any;
}
