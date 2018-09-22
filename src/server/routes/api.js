const router = require('express').Router();
const fs = require('fs');
// const ftp = require('ftp');
const path = require('path');
// const shp2json = require('shp2json');
const shapefile = require('shapefile');
const shpjs = require('shpjs');
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

// TEMP
// APACHE_SERVER_IP = '192.168.170.156';

router.get('/layersMeta', (req, res, next) => {
  // TODO
  res.json({
    layers: [
      {
        layerPath: 'http://127.0.0.1:3000/assets/RegScene/Cesium_Reg.json',
        layerIndex: 3,
        layerType: LAYER_TYPE_TILE,
        layerName: '3D Tile Layer'
      },
      {
        layerPath: 'http://127.0.0.1:3000/assets/kml/Layer KML.KML',
        layerIndex: 2,
        layerType: LAYER_TYPE_KML,
        layerName: 'KML Layer'
      },
      {
        layerPath: 'http://127.0.0.1:3000/assets/shp/Layer SHP.shp',
        layerIndex: 1,
        layerType: LAYER_TYPE_SHP,
        layerName: 'Shape Layer'
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
