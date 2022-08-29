
// Link to the code: https://code.earthengine.google.com/de7bdeb03530a951d622c23d90b1ed27
// Importing module
var TAGEE = require('users/joselucassafanelli/TAGEE:TAGEE-functions');

var DEMAttributes = TAGEE.terrainAnalysis(TAGEE, dem, pts);
print(DEMAttributes.bandNames(), 'Parameters of Terrain');

// get the slope of the points
var terrain = DEMAttributes.reduceRegions({
                    collection: pts, 
                    reducer: ee.Reducer.first(), 
                    scale: 30}); // define a scale in meters

Export.table.toDrive({
  collection: terrain, 
  description: 'terrain', 
  fileFormat: 'CSV', 
});
