import { Injectable } from '@angular/core';

class DATUM {
  constructor(
    public a: number,
    public b: number,
    public f: number,
    public esq: number,
    public e: number,
    public dX: number,
    public dY: number,
    public dZ: number
  ) {}
}

class GRID {
  constructor(
    public lon0: number,
    public lat0: number,
    public k0: number,
    public false_e: number,
    public false_n: number
  ) {}
}

@Injectable()
export class GeoConverterService {
  eDatum = {
    eWGS84: 0,
    eGRS80: 1,
    eCLARK80M: 2
  };

  Datum = [
    new DATUM(
      6378137,
      6356752.3142,
      0.0033528106647474805,
      0.006694380004260807,
      0.0818191909289062,
      0,
      0,
      0
    ),
    new DATUM(
      6378137,
      6356752.3141,
      0.003352810681182319,
      0.00669438002290272,
      0.0818191910428276,
      -48,
      55,
      52
    ),
    new DATUM(
      6378300.789,
      6356566.4116309,
      0.0034075497672643507,
      0.006803488139112318,
      0.0824832597507659,
      -235,
      -85,
      264
    )
  ];
  gGrid = {
    gICS: 0,
    gITM: 1
  };

  Grid = [
    new GRID(0.6145667421719, 0.5538644768276276, 1, 170251.555, 2385259),
    new GRID(
      0.6144347322546893,
      0.5538696546377418,
      1.0000067,
      219529.584,
      2885516.9488
    )
  ];

  private sin2(t) {
    return Math.sin(t) * Math.sin(t);
  }

  private cos2(t) {
    return Math.cos(t) * Math.cos(t);
  }

  private tan2(t) {
    return Math.tan(t) * Math.tan(t);
  }

  private tan4(t) {
    return Math.tan2(t) * Math.tan2(t);
  }

  private wgs842itm(t, a) {
    const n = {
      lat: (t * Math.PI) / 180,
      lon: (a * Math.PI) / 180,
      olat: 0,
      olon: 0
    };
    this.Molodensky(n, this.eDatum.eWGS84, this.eDatum.eGRS80);
    const o = this.LatLon2Grid(
      n.olat,
      n.lon,
      this.eDatum.eGRS80,
      this.gGrid.gITM
    );
    return (o.E = o.E - 65.737), (o.N = o.N + 6.125), o;
  }

  private itm2wgs84(t, a) {
    const n = this.Grid2LatLon(a, t, this.gGrid.gITM, this.eDatum.eGRS80);
    return (
      this.Molodensky(n, this.eDatum.eGRS80, this.eDatum.eWGS84),
      {
        lat: (180 * n.olat) / Math.PI,
        lon: (180 * n.olon) / Math.PI
      }
    );
  }

  private Grid2LatLon(t, a, n, o) {
    const i = t + this.Grid[n].false_n,
      r = a - this.Grid[n].false_e,
      s = i / this.Grid[n].k0,
      e = this.Datum[o].a,
      u = this.Datum[o].b,
      h = this.Datum[o].e,
      M = this.Datum[o].esq,
      l =
        s /
        (e *
          (1 -
            Math.pow(h, 2) / 4 -
            (3 * Math.pow(h, 4)) / 64 -
            (5 * Math.pow(h, 6)) / 256)),
      D = Math.sqrt(1 - M),
      m = (1 - D) / (1 + D),
      G = (21 * m * m) / 16 - (55 * m * m * m * m) / 32,
      d = (151 * m * m * m) / 96,
      c = (1097 * m * m * m * m) / 512,
      f =
        l +
        ((3 * m) / 2 - (27 * m * m * m) / 32) * Math.sin(2 * l) +
        G * Math.sin(4 * l) +
        d * Math.sin(6 * l) +
        c * Math.sin(8 * l),
      v = Math.sin(f),
      w = Math.cos(f),
      I = v / w,
      g = (h * e) / u,
      S = g * g,
      T = S * w * w,
      L = I * I,
      R = (e * (1 - h * h)) / Math.pow(1 - h * v * (h * v), 1.5),
      k = e / Math.sqrt(1 - h * v * (h * v)),
      q = r / (k * this.Grid[n].k0),
      p = q,
      P = ((1 + 2 * L + T) * (q * q * q)) / 6,
      _ =
        (q *
          q *
          q *
          q *
          q *
          (5 - 2 * T + 28 * L - 3 * T * T + 8 * S * S + 24 * L * L)) /
        120;
    return {
      lat:
        f -
        ((k * I) / R) *
          ((q * q) / 2 -
            (q * q * q * q * (5 + 3 * L + 10 * T - 4 * T * T - 9 * S * S)) /
              24 +
            (q *
              q *
              q *
              q *
              q *
              q *
              (61 + 90 * L + 298 * T + 45 * L * L - 3 * T * T - 252 * S * S)) /
              720),
      lon: this.Grid[n].lon0 + (p - P + _) / w
    };
  }

  private Molodensky(t, a, n) {
    const o = this.Datum[a].dX - this.Datum[n].dX,
      i = this.Datum[a].dY - this.Datum[n].dY,
      r = this.Datum[a].dZ - this.Datum[n].dZ,
      s = Math.sin(t.lat),
      e = Math.cos(t.lat),
      u = Math.sin(t.lon),
      h = Math.cos(t.lon),
      M = Math.pow(s, 2),
      l = this.Datum[a].f,
      D = this.Datum[n].f - l,
      m = this.Datum[a].a,
      G = this.Datum[n].a - m,
      d = this.Datum[a].esq,
      c = 1 / (1 - l),
      f = m / Math.sqrt(1 - d * M),
      v = (m * (1 - d)) / Math.pow(1 - d * M, 1.5),
      w =
        (-o * s * h -
          i * s * u +
          r * e +
          (G * f * d * s * e) / m +
          +D * (v * c + f / c) * s * e) /
        (v + 0);
    t.olat = t.lat + w;
    const I = (-o * u + i * h) / ((f + 0) * e);
    t.olon = t.lon + I;
  }

  private LatLon2Grid(t, a, n, o) {
    const i = this.Datum[n].a,
      r = this.Datum[n].e,
      s = this.Datum[n].b,
      e = Math.sin(t),
      u = Math.cos(t),
      h = u * u,
      M = (e * e) / h,
      l = r * r,
      D = l * l,
      m = D * l,
      G = (r * i) / s,
      d = G * G,
      c = (15 * D) / 256 + (45 * m) / 1024,
      f = (35 * m) / 3072,
      v =
        i *
        ((1 - l / 4 - (3 * D) / 64 - (5 * m) / 256) * t -
          ((3 * l) / 8 + (3 * D) / 32 + (45 * m) / 1024) * Math.sin(2 * t) +
          c * Math.sin(4 * t) -
          f * Math.sin(6 * t)),
      w = i / Math.sqrt(1 - r * e * (r * e)),
      I = a - this.Grid[o].lon0,
      g = this.Grid[o].k0,
      S =
        v * g +
        ((g * w * e * u) / 2) * I * I +
        ((g * w * e * u * h) / 24) *
          (5 - M + 9 * d * h + 4 * d * d * h * h) *
          I *
          I *
          I *
          I -
        this.Grid[o].false_n;
    return {
      E:
        g * w * u * I +
        ((g * w * u * h) / 6) * (1 - M + d * u * u) * I * I * I +
        this.Grid[o].false_e +
        0.5,
      N: S + 0.5
    };
  }

  public convertITMToWGS(t, a) {
    return this.itm2wgs84(t, a);
  }

  public convertWGSToITM(t, a) {
    return this.wgs842itm(t, a);
  }
}
