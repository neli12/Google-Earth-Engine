var bbox = ee.Geometry.Rectangle({coords: [-54.9144472200180971,-17.0770074996950001, -54.8444422002885972,-17.0506326361065987], geodesic: false});
var S2A_Image = ee.Image('COPERNICUS/S2/20220811T134709_20220811T135649_T21KYB')
                  .select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12'])
                  .clip(bbox)
                  
Map.addLayer(S2A_Image, {bands: ['B4', 'B3', 'B2'], min: 1401, max: 2691});
                  
var bands = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12']

//Merge land cover classifications into one feature class
var newLULC = Trees.merge(Grass);
print(newLULC)
 
//Make training data by 'overlaying' the points on the image.
var points = S2A_Image.sampleRegions({
  collection: newLULC, 
  properties: ['Class'], 
  scale: 10, geometries: true
 }).randomColumn();    
 
//print(points)

Export.table.toDrive({collection:points, description: 'points'})
