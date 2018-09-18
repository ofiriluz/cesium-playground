import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const CLIENT_HOST = 'http://localhost';
const CLIENT_PORT = '8080';
const CLIENT_LAYERS_API = '/api/layers';
const CLIENT_SHP_AS_GEO_JSON_API = '/api/shpAsGeoJson';

@Injectable()
export class LayersAPIService {
  constructor(private http: HttpClient) {}

  public getLayersMeta() {
    return this.http.get(CLIENT_HOST + ':' + CLIENT_PORT + CLIENT_LAYERS_API);
  }

  public getShpAsGeoJson(shpPath: string) {
    const params = new HttpParams();
    params.append('shpPath', shpPath);
    return this.http.get(CLIENT_HOST + ':' + CLIENT_PORT + CLIENT_SHP_AS_GEO_JSON_API, { params: params });
  }
}
