import { Injectable, EventEmitter } from '@angular/core';
import { AppConfigService } from 'src/app/services/app-config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// import * as Pbf from 'pbf';
import * as VT from 'node_modules/@mapbox/vector-tile';

// TODO - Remove
const MAPBOX_ACCESS_TOKEN = 'sk.eyJ1IjoiYmFrYm9rIiwiYSI6ImNqbjYyY3ZpMzAxYWYzdnBmdHI5d2xndGcifQ.B8XNQc77lHLuGFlyXunLjQ';
const MAPBOX_TILE_SERVERS = ['https://a.tiles.mapbox.com',
                             'https://b.tiles.mapbox.com',
                             'https://c.tiles.mapbox.com',
                             'https://d.tiles.mapbox.com'];
const MAPBOX_STREETS_SUB = 'v4/mapbox.mapbox-terrain-v2,mapbox.mapbox-streets-v7';

class Queue<T> {
  _store: T[] = [];
  push(val: T) {
    this._store.push(val);
  }
  pop(): T | undefined {
    return this._store.shift();
  }
  size(): number {
    return this._store.length;
  }
}

@Injectable()
export class MapBoxService {
  private isCacheActive = false;
  private tilesetMetadata: any;
  // Queue of levelyx and dict with data, both represented by the id which is concat of levelyx
  private loadedTilesData: any;
  private loadedTilesMetadata: any;
  private loadedTilesQueue = new Queue<string>();
  private maxCacheSize = 100;

  public addEvent$ = new EventEmitter<{}>();
  public removeEvent$ = new EventEmitter<{}>();

  constructor(private appConf: AppConfigService, private httpClient: HttpClient) {
    this.loadedTilesMetadata = null;
    this.loadedTilesData = {};
  }

  private loadTilesMetaData(baseUrlIndex: number) {
    return new Promise((resolve, reject) => {
      if (baseUrlIndex >= MAPBOX_TILE_SERVERS.length) {
        reject('Could not load metadata');
        return;
      }
      const url = MAPBOX_TILE_SERVERS[baseUrlIndex] + '/' + MAPBOX_STREETS_SUB + '.json';
      console.log(url);
      this.httpClient.get(url, {
          params: {
            access_token: MAPBOX_ACCESS_TOKEN
          }
        }
      ).toPromise().then((data) => {
        console.log(data);
        console.log(data['bounds']);
        // Tile metadata loaded successfully
        this.loadedTilesMetadata = data;
        resolve();
      }).catch((err) => {
        console.log(err);
        this.loadTilesMetaData(baseUrlIndex + 1);
      });
    });
  }

  private doLoad(baseUrlIndex: number, level: number, x: number, y: number) {
    this.loadTile(baseUrlIndex, level, x, y)
    .catch((err) => {
      // this.doLoad(baseUrlIndex + 1, level, x, y);
    }).then(() => {

    });
  }

  private loadTile(baseUrlIndex: number, level: number, x: number, y: number) {
    return new Promise((resolve, reject) => {
      if (baseUrlIndex >= MAPBOX_TILE_SERVERS.length) {
        reject('Failed to load tile');
        return;
      }

      const url = MAPBOX_TILE_SERVERS[baseUrlIndex] + '/' + MAPBOX_STREETS_SUB + '/' + level + '/' + x + '/' + y + '.vector.pbf';
      console.log(url);
      this.httpClient.get(url, {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN
        },
        responseType : 'arraybuffer'
      }).toPromise().then((data: any) => {
        console.log(data);
        // If needed, pop an id from the queue
        if (this.loadedTilesQueue.size() === this.maxCacheSize) {
          const poppedId = this.loadedTilesQueue.pop();
          const splittedId = poppedId.split(':');
          this.removeEvent$.emit({level: splittedId[0],
                                  x: splittedId[1],
                                  y: splittedId[2],
                                  id: poppedId,
                                  data: this.loadedTilesData[poppedId]});
          delete this.loadedTilesData[poppedId];
        }
        // Tile loaded successfully, parse PBF and save it
        const id = '' + level + ':' + x + ':' + y;
        // console.log('a');
        // try
        // {
        // const pbf = new VT.VectorTile(new Pbf(data));
        // }
        // catch(e)
        // {
        //   console.log(e);
        // }
        // console.log('b');
        // console.log(pbf);
        // pbf.readFields((tag, vals, pb) => {
        //   console.log(tag);
        //   console.log(vals);
        // });
        // this.loadedTilesData[id] = Object.read(pbf);
        this.loadedTilesQueue.push(id);
        this.addEvent$.emit({level: level,
                              x: x,
                              y: y,
                              id: id,
                              data: this.loadedTilesData[id]});
        resolve();
      }).catch((err) => {
        // console.log(err);
        this.doLoad(baseUrlIndex + 1, level, x, y);
      });
    });
  }

  private loadTileQuery(lat, lon) {

  }

  private onPreRenderEvent() {
    // Go over the tiles to render
    // For each tile check if it is cached, if not retrieve and cache it
    // The cache is at most of 100 tiles, will trim based on oldest to newest
    const tilesToRender = this.appConf.getAppViewer().scene.globe._surface.tileProvider._tilesToRenderByTextureCount;
    if (Cesium.defined(tilesToRender)) {
        for (let j = 0, len = tilesToRender.length; j < len; j++) {
            const quadTrees = tilesToRender[j];
            if (Cesium.defined(quadTrees)) {
                for (let i = 0; i < quadTrees.length; i++) {
                    // Add to the cache and load if not present
                    const id = '' + quadTrees[i]._level + ':' + quadTrees[i]._x + ':' + quadTrees[i]._y;
                    if (!(id in this.loadedTilesData)) {
                      // Load the tile, add an empty data to make sure there wont be another load call to the same tile
                      this.loadedTilesData[id] = {};
                      this.doLoad(0, quadTrees[i]._level, quadTrees[i]._x, quadTrees[i]._y);
                    }
                }
            }
        }
    }
  }

  public enableCache() {
    if (!this.isCacheActive) {
      this.isCacheActive = true;

      // If this is the first time enabling, load the metadata
      if (this.loadedTilesMetadata == null) {

        console.log('Meta');
        this.loadTilesMetaData(0).then(() => {
          // Start the caching listener
          this.appConf.getAppViewer().scene.preRender.addEventListener(this.onPreRenderEvent, this);
        }).catch((err) => {
          // TODO
        });
      } else {
        this.appConf.getAppViewer().scene.preRender.addEventListener(this.onPreRenderEvent, this);
      }
    }
  }

  public disableCache() {
    if (this.isCacheActive) {
      this.isCacheActive = false;

      // Stop the caching listener
      this.appConf.getAppViewer().scene.preRender.removeEventListener(this.onPreRenderEvent, this);
    }
  }

  public getCurrentTilesetCache() {
    return this.loadedTilesData;
  }
}
