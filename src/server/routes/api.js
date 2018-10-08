const router = require('express').Router();
const fs = require('fs');
// const ftp = require('ftp');
const path = require('path');
// const shp2json = require('shp2json');
const shapefile = require('shapefile');
const shpjs = require('shpjs');
const glob = require('glob');
const sharp = require('sharp');
// const tiffToPng = require('tiff-to-png');

// const ftpClient = new ftp();
// ftpClient.on('ready', () => {
//   console.log('ftp connected');
// });

// ftpClient.connect({
//   host: '192.168.170.155',
//   user: 'playground',
//   password: 'playground'
// });

LAYER_TYPE_TILE = 0;
LAYER_TYPE_KML = 1;
LAYER_TYPE_SHP = 2;
LAYER_TYPE_TERRAIN = 3;
LAYER_TYPE_ORTHO = 4;

// TEMP
// APACHE_SERVER_IP = '192.168.170.156';

router.get('/layersMeta', (req, res, next) => {
  // TODO
  res.json({
    layers: [
      {
        layerPath: 'http://127.0.0.1:3000/assets/TLV/Scene/Cesi.json',
        layerIndex: 3,
        layerType: LAYER_TYPE_TILE,
        layerName: 'שכבת תלת מימד'
      },
      {
        layerPath: 'http://127.0.0.1:3000/assets/kml/Layer KML.KML',
        layerIndex: 2,
        layerType: LAYER_TYPE_KML,
        layerName: 'שכבת דרכים KML'
      },
      {
        layerPath: 'http://127.0.0.1:3000/assets/shp/Layer SHP.shp',
        layerIndex: 1,
        layerType: LAYER_TYPE_SHP,
        layerName: 'שכבת דרכים SHP'
      },
      {
        layerPath: 'http://127.0.0.1:3000/assets/tiles',
        layerIndex: 1,
        layerType: LAYER_TYPE_TERRAIN,
        layerName: 'מפת גבהים'
      },
      {
        layerPath: 'http://127.0.0.1:3000/assets/imagery',
        layerIndex: 1,
        layerType: LAYER_TYPE_ORTHO,
        layerName: 'אורתופוטו'
      }
    ]
  });
});

function writeFeatureCollection(source, out) {
  out.write("{\"type\":\"FeatureCollection\",\"bbox\":");
  out.write(JSON.stringify(source.bbox));
  out.write(",\"features\":[");
  return source.read().then(function(result) {
    if (result.done) return;
    out.write(JSON.stringify(result.value));
    return source.read().then(function repeat(result) {
      if (result.done) return;
      out.write(",");
      out.write(JSON.stringify(result.value));
      return source.read().then(repeat);
    });
  }).then(function() {
    out.write("]}\n");
    out.end();
  });
}

router.get('/orthoMeta', (req, res, next) => {
  // TEMP
  assetsIdx = req.query['orthoPath'].indexOf('assets');
  prefix = req.query['orthoPath'].slice(0, assetsIdx);
  orthoPathRl = path.join(__dirname, '../', req.query['orthoPath'].slice(assetsIdx));

  // Go over the tif/tfw files in the dir and create the json
  const orthoJson = {ortho: []};
  glob(path.join(orthoPathRl, '*.tif'), {}, (err, files) => {
    // pngTocreate = [];
    files.forEach((tif) => {
      const tifParsed = path.parse(tif);
      const pngPath = path.join(orthoPathRl, tifParsed.name + '.png');
      const tfwPath = path.join(orthoPathRl, tifParsed.name + '.tfw');
      pngPostFix = path.join(tifParsed.dir, tifParsed.name + '.png');
      pngPostFix = pngPostFix.slice(tif.indexOf('assets'));

      if (!fs.existsSync(pngPath)) {
        sharp(tif).toFile(pngPath);
        // pngTocreate.push(path.normalize(tif));
      }

      // Read the tfw
      data = fs.readFileSync(tfwPath, 'utf8').trim();

      // Add the layer
      // tif = tif.slice(tif.indexOf('assets'));
      layer = {layerPath: prefix + pngPostFix, layerTFW: data.split('\n').map(x => parseFloat(x))};
      orthoJson.ortho.push(layer);
    })
    // if (pngTocreate.length > 0) {
    //   console.log(pngTocreate);
    //   const conv = new tiffToPng({logLevel: 1})
    //   conv.convertArray(pngTocreate, path.normalize(orthoPathRl)).then((out) => {
    //     console.log(out);
    //   });
    // }


    res.json(orthoJson);
  })
});

router.get('/shpAsGeoJson', (req, res, next) => {
  // TEMP
  assetsIdx = req.query['shpPath'].indexOf('assets');
  shpPathRl = path.join(__dirname, '../', req.query['shpPath'].slice(assetsIdx));

  const shpPath = path.parse(shpPathRl);
  const geoPath = path.join(shpPath.dir, shpPath.name) + '.json';
  fs.exists(geoPath, (exists) => {
    if(!exists) {
      console.log('Creating geojson from shp')
      const prjPath = path.join(shpPath.dir, shpPath.name) + '.prj';
      const dbfPath = path.join(shpPath.dir, shpPath.name) + '.dbf';
      fs.writeFileSync(geoPath, JSON.stringify(
        shpjs.combine([shpjs.parseShp(fs.readFileSync(shpPathRl),
          fs.readFileSync(prjPath)),
        shpjs.parseDbf(fs.readFileSync(dbfPath))])));
    }
    res.json('http://127.0.0.1:3000/assets/shp/' + shpPath.name + '.json');
  })
  // Check if the shape is already cached as geojson on the ftp server
  // ftpClient.cwd(folder, (err, currDir) => {
  //   ftpClient.list((err, list) => {
  //     for(item in list) {
  //       if(item.indexOf(fileName) >= 0 && item.endsWith('.json')){
  //         res.json(path.join(folder, item));
  //       }
  //     }
  //     // Does not contain, create it
  //     ftpClient.get(shpPath.base, (err, stream) => {
  //       ftpClient.put(shp2json(stream), shpPath.name + '.json', (err) => {
  //         res.json(path.join(folder, shpPath.name + '.json'));
  //       })
  //     })
  //   })
  // });
});

module.exports = router;
