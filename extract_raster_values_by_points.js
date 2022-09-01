
// Link to the code: https://code.earthengine.google.com/5ff32a17a4fde7900f03d42e4107e293

// Add map
Map.centerObject(pts)
Map.addLayer(pts)

// Importing module
var TAGEE = require('users/joselucassafanelli/TAGEE:TAGEE-functions');

var DEMAttributes = TAGEE.terrainAnalysis(TAGEE, dem, pts);
print(DEMAttributes.bandNames(), 'Parameters of Terrain');

// get the slope of the points
var terrain = DEMAttributes.reduceRegions({
                    collection: pts, 
                    reducer: ee.Reducer.first(), 
                    scale: 30}); // define a scale in meters

print(terrain);
Export.table.toDrive({
  collection: terrain, 
  description: 'terrain', 
  fileFormat: 'CSV', 
});
