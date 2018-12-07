export enum LayerType {
  TILE,
  KML,
  SHP,
  TERRAIN,
  ORTHO,
  STREETS,
  BUILDINGNUMBERS,
  MAP,
  POINTS,
  POLYLINE
}

export class LayerSource {
  public layerPath: string;
  public layerIndex: number;
  public layerType: LayerType;
  public layerName: string;
  public layerProps: any;
  public isShownAtStart: boolean;
}
