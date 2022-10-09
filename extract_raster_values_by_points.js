
// Link to the code: https://code.earthengine.google.com/854bd58026e79d5e171ce1e6c4da8c94)

//Add layers to the map
Map.addLayer(DEM, {min: 100, max: 250, palette: ['ff0a0a','ffec06','82ff10','194bff']}, 'DEM');
Map.addLayer(pts)
Map.centerObject(pts);

// Get the DEM values of the points
var pts_raster = DEM.reduceRegions({
                    collection: pts, 
                    reducer: ee.Reducer.mean(), 
                    scale: 15}); // define a scale in meters

print(pts_raster);

//Export to 
Export.table.toDrive({
  collection: pts_raster, 
  description: 'pts_dem', 
  fileFormat: 'CSV', 
});

// Importing module
var TAGEE = require('users/joselucassafanelli/TAGEE:TAGEE-functions');

var DEMAttributes = TAGEE.terrainAnalysis(TAGEE, DEM, pts);
print(DEMAttributes.bandNames(), 'Parameters of Terrain');

// Get all the values of the RaserStack of the points
var terrain = DEMAttributes.reduceRegions({
                    collection: pts, 
                    reducer: ee.Reducer.mean(), 
                    scale: 15}); // define a scale in meters

print(terrain);

//Export to drive
Export.table.toDrive({
  collection: terrain, 
  description: 'terrain_pts_all', 
  //selectors: ['Experiment', 'Aspect', 'Slope', 'Eastness', 'Northness'],
  fileFormat: 'CSV', 
});
