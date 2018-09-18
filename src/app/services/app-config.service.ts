import { Injectable } from '@angular/core';

@Injectable()
export class AppConfigService {
  private viewer: any;
  constructor() {

  }

  public setAppViewer(viewer) {
    this.viewer = viewer;
  }

  public getAppViewer(): any {
    return this.viewer;
  }
}
