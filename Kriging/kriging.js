//Define geometry

var geometry = ee.Geometry.Rectangle({coords: [-48.1399397050000033,-23.1525209989139995, -47.2015595592082491,-22.2742381456298766], geodesic: false});

var pixelValues = ee.FeatureCollection('users/nelisilvero/SYSIsample102033shape');   // add a shapefile from your asset
Map.addLayer(geometry); 
Map.addLayer(pixelValues);

// Select the column to interpolate
var band = 'B1'  //name of the column in the shapefile

// Interpolate reflectance from the sampled points.
// Here is important to note that the semivariogram parameters should be calculated in another software, like in R or Python
var interpolated = pixelValues.kriging({
  propertyName: band,
  shape: 'exponential',
  range: 4244.78,
  sill: 20000,
  nugget: 11987.36,
  maxDistance: 56919.9,
  reducer: 'mean',
}).toInt16();

Map.addLayer(interpolated);

// Export the kriged map
var scale = 30;
Export.image.toDrive({image: interpolated, description: 'SYSI_kriged_'+band+'_'+scale+'m', 
scale: scale, region: geometry, maxPixels: 1000000000000});