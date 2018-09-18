import { Injectable } from '@angular/core';

@Injectable()
export class SmartPhoneService {
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

  public any() {
    return (
      this.Android() ||
      this.BlackBerry() ||
      this.iOS() ||
      this.Opera() ||
      this.Windows()
    );
  }
}
