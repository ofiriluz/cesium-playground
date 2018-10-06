import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const CLIENT_HOST = 'http://127.0.0.1';
const CLIENT_PORT = '3000';
const CLIENT_LAYERS_META_API = '/api/layersMeta';
const CLIENT_SHP_AS_GEO_JSON_API = '/api/shpAsGeoJson';
const CLIENT_ORTHO_META_API = '/api/orthoMeta';

@Injectable()
export class LayersAPIService {
  constructor(private http: HttpClient) {}

  public getLayersMeta() {
    return this.http.get(
      CLIENT_HOST + ':' + CLIENT_PORT + CLIENT_LAYERS_META_API
    );
  }

  public getShpAsGeoJson(shpPath: string) {
    return this.http.get(
      CLIENT_HOST + ':' + CLIENT_PORT + CLIENT_SHP_AS_GEO_JSON_API,
      {
        params: {
          shpPath: shpPath
        }
      }
    );
  }

  public getOrthoMeta(orthoPath: string) {
    return this.http.get(
      CLIENT_HOST + ':' + CLIENT_PORT + CLIENT_ORTHO_META_API,
      {
        params: {
          orthoPath: orthoPath
        }
      }
    );
  }
}
