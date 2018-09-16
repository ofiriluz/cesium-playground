import { EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { Component, OnInit, Output } from '@angular/core';
import {
  ActionType,
  AcNotification,
  AcLayerComponent,
  SceneMode,
  MapLayerProviderOptions,
  ViewerConfiguration
} from 'angular-cesium';
import { Observable, Subscriber } from 'rxjs';

@Component({
  selector: 'cesium-viewer',
  providers: [ViewerConfiguration],
  templateUrl: './cesium-viewer.component.html',
  styleUrls: ['./cesium-viewer.component.css']
})
export class CesiumViewerComponent implements OnInit, AfterViewInit {
  @ViewChild('layer')
  arcGisMapServerProvider = MapLayerProviderOptions.ArcGisMapServer;
  sceneMode = SceneMode.SCENE3D;
  boundingSphere = new Cesium.BoundingSphere(
    Cesium.Cartesian3.fromDegrees(34.94329436, 32.57149369, 169.0831419),
    117.9757447
  );

  Android() {
    return navigator.userAgent.match(/Android/i);
  }

  BlackBerry() {
    return navigator.userAgent.match(/BlackBerry/i);
  }

  iOS() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  }

  Opera() {
    return navigator.userAgent.match(/Opera Mini/i);
  }

  Windows() {
    return navigator.userAgent.match(/IEMobile/i);
  }

  any() {
    return (
      this.Android() ||
      this.BlackBerry() ||
      this.iOS() ||
      this.Opera() ||
      this.Windows()
    );
  }

  constructor(private viewerConf: ViewerConfiguration) {
    const terrainModels = Cesium.createDefaultTerrainProviderViewModels();
    viewerConf.viewerOptions = {
      selectionIndicator: false,
      timeline: false,
      infoBox: false,
      fullscreenButton: false,
      baseLayerPicker: false,
      animation: false,
      shouldAnimate: false,
      homeButton: true,
      geocoder: false,
      scene3DOnly: true,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      terrainProviderViewModels: terrainModels,
      selectedTerrainProviderViewModel: terrainModels[1]
    };

    viewerConf.viewerModifier = (viewer: any) => {
      viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );
      viewer.bottomContainer.remove();

      // Override behavior of home button
      viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
        function(commandInfo) {
          // Fly to custom position
          viewer.camera.flyToBoundingSphere(this.boundingSphere);

          // Tell the home button not to do anything
          commandInfo.cancel = true;
        }
      );

      viewer.camera.flyToBoundingSphere(this.boundingSphere, { duration: 0 });

      const tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: 'assets/Scene/Cesium_ITM.json',
          maximumScreenSpaceError: this.any() ? 8 : 1,
          maximumNumberOfLoadedTiles: this.any() ? 10 : 1000
        })
      );
    };
  }

  ngAfterViewInit(): void {}
  ngOnInit(): void {}
  removeAll() {}
}
