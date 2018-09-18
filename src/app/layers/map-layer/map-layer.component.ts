import { AfterViewInit, Component, ViewChild } from '@angular/core';
import {
  MapLayerProviderOptions,
  AcMapLayerProviderComponent,
  ActionType,
  AcNotification,
  AcLayerComponent,
  SceneMode,
  ViewerConfiguration
} from 'angular-cesium';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'map-layer',
  providers: [ViewerConfiguration],
  templateUrl: 'map-layer.component.html'
})
export class MapLayerComponent implements AfterViewInit, OnInit {
  Cesium = Cesium;
  sceneMode = SceneMode.SCENE3D;
  // boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(34.91930466, 32.48847722, 53.91294144), 1403.960694);
  // boundingSphere = new Cesium.BoundingSphere(
  //   Cesium.Cartesian3.fromDegrees(34.94329436, 32.57149369, 169.0831419),
  //   117.9757447
  // );

  constructor(private viewerConf: ViewerConfiguration, private appService: AppConfigService) {
    const terrainModels = Cesium.createDefaultTerrainProviderViewModels();
    const imageryModels = Cesium.createDefaultImageryProviderViewModels();
    viewerConf.viewerOptions = {
      selectionIndicator: false,
      timeline: false,
      infoBox: false,
      fullscreenButton: false,
      baseLayerPicker: true,
      animation: false,
      shouldAnimate: false,
      homeButton: true,
      geocoder: false,
      scene3DOnly: true,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      selectedImageryProviderViewModel: imageryModels[9],
      terrainProviderViewModels: terrainModels,
      selectedTerrainProviderViewModel: terrainModels[1],
      orderIndependentTranslucency: false
    };

    viewerConf.viewerModifier = (viewer: any) => {
      this.appService.setAppViewer(viewer);

      viewer.scene.globe.depthTestAgainstTerrain = false;
      viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );
      viewer.bottomContainer.remove();
    };
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {}
}
