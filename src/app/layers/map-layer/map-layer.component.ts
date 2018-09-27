import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  MapLayerProviderOptions,
  AcMapLayerProviderComponent,
  ActionType,
  AcNotification,
  AcLayerComponent,
  SceneMode,
  ViewerConfiguration,
  CesiumService,
  AcMapComponent
} from 'angular-cesium';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { AppConfigService } from 'src/app/services/app-config.service';
import { BaseLayer } from 'src/app/layers/base-layer';
import { LayerSource, LayerType } from 'src/app/models/layer-source.model';

@Component({
  selector: 'map-layer',
  providers: [ViewerConfiguration, CesiumService],
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'map-layer.component.html',
  styleUrls: ['./map-layer.component.css']
})
export class MapLayerComponent implements AfterViewInit, OnInit, BaseLayer {
  Cesium = Cesium;
  MapLayerProviderOptions = MapLayerProviderOptions;
  sceneMode = SceneMode.SCENE3D;
  @ViewChild('mapLayer')
  mapLayer: AcMapComponent;
  layerSource: LayerSource;
  public showMap = true;

  constructor(private viewerConf: ViewerConfiguration, private appService: AppConfigService) {
    this.layerSource = new LayerSource();
    this.layerSource.layerIndex = 0;
    this.layerSource.layerName = 'MAP';
    this.layerSource.layerPath = '';
    this.layerSource.layerType = LayerType.MAP;
    const terrainModels = Cesium.createDefaultTerrainProviderViewModels();
    const imageryModels = Cesium.createDefaultImageryProviderViewModels();
    viewerConf.viewerOptions = {
      selectionIndicator: true,
      timeline: false,
      infoBox: true,
      fullscreenButton: true,
      baseLayerPicker: false,
      animation: false,
      shouldAnimate: true,
      homeButton: false,
      geocoder: true,
      scene3DOnly: true,
      navigationHelpButton: true,
      navigationInstructionsInitiallyVisible: false,
      selectedImageryProviderViewModel: imageryModels[9],
      terrainProviderViewModels: terrainModels,
      selectedTerrainProviderViewModel: terrainModels[1],
      orderIndependentTranslucency: false
    };

    viewerConf.viewerModifier = (viewer: any) => {
      this.appService.setAppViewer(viewer);
      viewer.terrainProvider = Cesium.createWorldTerrain({
        requestVertexNormals: true
      });
      viewer.scene.pickTranslucentDepth = true;
      viewer.scene.globe.depthTestAgainstTerrain = false;
      viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );
      viewer.bottomContainer.remove();
      viewer.shadowMap.softShadows = true;
      viewer.shadowMap.darkness = 0.6;
    };
  }

  public getLayerEntity() {
    return this.mapLayer;
  }

  public getLayerMeta(): LayerSource {
    return this.layerSource;
  }

  public moveToLayer(): void {
    return;
  }

  public showLayer(): void {
    this.showMap = true;
  }

  public hideLayer(): void {
    this.showMap = false;
  }

  public isLayerVisible(): boolean {
    return this.showMap;
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {}
}
