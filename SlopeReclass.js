//Map.addLayer(feature)

// Add raster.
var elev = ee.Image("CGIAR/SRTM90_V4")

// Get slope.
var slope = ee.Terrain.slope(elev).clip(feature);

var slope_reclass = ee.Image(1)
                      .where(slope.gt(1.718358002).and(slope.lte(4.57392126)), 2)
                      .where(slope.gt(4.57392126).and(slope.lte(9.090276921)), 3)
                      .where(slope.gt(9.090276921).and(slope.lte(16.699244234)), 4)
                      .where(slope.gt(16.699244234).and(slope.lte(24.227745318)), 5)
                      .where(slope.gt(24.227745318), 6).clip(feature);

var all_classes_area = ee.Image.pixelArea().addBands(slope_reclass).divide(1e6)
                         .reduceRegion({
                           reducer: ee.Reducer.sum().group(1),
                           geometry: feature,
                           scale: 90,
                           bestEffort:true
                         })
                         
print(all_classes_area, 'All classes in square km')
// Display the result.
Map.addLayer(slope_reclass, {}, 'slope');
Export.image.toDrive({image: slope, description: 'SlopeMT-MS-GO', crs: 'EPSG:4326', maxPixels: 12848525904})
//Map.addLayer(slopereclass.clip(feature), {min: 1, max: 9, palette: ['black', 'red']},  'slopereclass');
