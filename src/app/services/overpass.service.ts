import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const GEOJSON_QUERY_TEMPLATE = '[out:json];{query}out;';
const OVERPASS_API_ENDPOINT = 'https://overpass-api.de/api/interpreter';

@Injectable()
export class OverpassService {
  Cesium = Cesium;

  private boundriesCache: Array<any>;

  constructor(private http: HttpClient) {
    this.boundriesCache = new Array<any>();
  }

  private constructBoundryStreetsQuery(bounds) {
    let rawQuery = GEOJSON_QUERY_TEMPLATE;
    rawQuery = rawQuery.replace('{query}', 'node('
                        + ((bounds.south * 180.0) / Math.PI)
                        + ',' + ((bounds.west * 180.0) / Math.PI)
                        + ',' + ((bounds.north * 180.0) / Math.PI)
                        + ',' + ((bounds.east * 180.0) / Math.PI)
                        + ')["addr:street"];');
    return rawQuery;
  }

  private constructBoundryAmenityQuery(bounds) {
    let rawQuery = GEOJSON_QUERY_TEMPLATE;
    rawQuery = rawQuery.replace('{query}', 'nwr('
                        + ((bounds.south * 180.0) / Math.PI)
                        + ',' + ((bounds.west * 180.0) / Math.PI)
                        + ',' + ((bounds.north * 180.0) / Math.PI)
                        + ',' + ((bounds.east * 180.0) / Math.PI)
                        + ')["amenity"];');
    return rawQuery;
  }

  private getContainedCacheRecord(bounds) {
    // For now just check equals of bounds
    for (const cacheRecord of this.boundriesCache) {
      if (Cesium.Rectangle.equals(cacheRecord.bounds, bounds)) {
        return cacheRecord;
      }
    }

    return null;
  }

  private constructBoundryQuery(bounds, type) {
    if (type === 'streets') {
      return this.constructBoundryStreetsQuery(bounds);
    } else if (type === 'amenity') {
      return this.constructBoundryAmenityQuery(bounds);
    }
  }

  public getBoundryInformation(bounds, type, resolve, reject) {
    // Check if there is already a boundry that includes this rectangle
    const containedCacheRecord = this.getContainedCacheRecord(bounds);

    if (containedCacheRecord && type in containedCacheRecord) {
      resolve(containedCacheRecord[type]);
    }

    // Construct the overpass query
    const query = this.constructBoundryQuery(bounds, type);

    // Request an api to get the data with the given bounds and cache it
    this.http.get(OVERPASS_API_ENDPOINT, {
      params: {
        data: query
      }
    }).toPromise().then((data) => {
      if (containedCacheRecord) {
        containedCacheRecord[type] = data;
      } else {
        const record = {
          bounds: bounds
        };
        record[type] = data;
        this.boundriesCache.push(record);
      }
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  }

  public getBoundryAmenityInformation(bounds) {
    return new Promise((resolve, reject) => {
      this.getBoundryInformation(bounds, 'amenity', resolve, reject);
    });
  }

  public getBoundryStreetsInformation(bounds) {
    return new Promise((resolve, reject) => {
      this.getBoundryInformation(bounds, 'streets', resolve, reject);
    });
  }

  public resolveAmenityIcon(amenity) {
    // TODO
  }
}
