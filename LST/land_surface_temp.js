//Load the coordinates of your study area
var area = ee.Geometry.Rectangle({coords:[-48.1399397050000388,-23.1525209996826966, -47.2014340000000061,-22.2741111864713233], geodesic: false})

//Search for image in your study area//
var iamges = ee.ImageCollection('LANDSAT/LT05/C01/T1_SR')           //image collection
              .filterBounds(area)                                  //filter by your study area
              .filterDate('1986-01-01','1986-12-31')               //select the images from 1986
              .filterMetadata('CLOUD_COVER', 'less_than', 10);     //select images only with cloud <10%
print(images);



//Load the two images of the dry period
var image076 = ee.Image('LANDSAT/LT05/C01/T1_SR/LT05_220076_19860610');
var image075 = ee.Image('LANDSAT/LT05/C01/T1_SR/LT05_220075_19860610');
print(image076);
print(image075);

//Plot the images
var visRGB = {bands: ['B3', 'B2', 'B1'], min: 0, max: 4000, gamma: 1.4,};   //visualization parameters
Map.addLayer(image076, visRGB, 'image075');
Map.addLayer(image075, visRGB, 'image076');

//Calculate NDVI
var ndvi076 = image076.normalizedDifference(['B3', 'B4']).rename('NDVI');
var ndvi075 = image075.normalizedDifference(['B3', 'B4']).rename('NDVI');
print(ndvi076,'ndvi076');
print(ndvi075,'ndvi075');

//Plot NDVI
var visNDVI = {min: -1, max: 1, palette: ['yellow', 'white', 'red']};
Map.addLayer(ndvi076, visNDVI, 'ndvi076');
Map.addLayer(ndvi075, visNDVI, 'ndvi075');


//Select the thermal band (B6 in Landsat 5) 
var thermal076= image076.select('B6').multiply(0.1);
var thermal075 = image075.select('B6').multiply(0.1);
Map.addLayer(thermal076, {min: 290.6693152713558, max: 294.40492360452276, palette: ['red', 'white', 'green']}, 'thermal076');
Map.addLayer(thermal075, {min: 290.2906074266626, max: 292.73439257333763, palette: ['red', 'white', 'green']}, 'thermal075');

//Find the NDVI min and max values
var min076 = ee.Number(ndvi076.reduceRegion({reducer: ee.Reducer.min(), scale: 30, maxPixels: 1e9}).values().get(0));
var min075 = ee.Number(ndvi075.reduceRegion({reducer: ee.Reducer.min(), scale: 30, maxPixels: 1e9}).values().get(0));
print(min076, 'min076');
print(min075, 'min075');


var max076 = ee.Number(ndvi076.reduceRegion({reducer: ee.Reducer.max(), scale: 30, maxPixels: 1e9}).values().get(0));
var max075 = ee.Number(ndvi075.reduceRegion({reducer: ee.Reducer.max(), scale: 30, maxPixels: 1e9}).values().get(0));
print(max076, 'max076')
print(max075, 'max075')


//Caculate the fractional vegetation cover
var FV076 =(ndvi076.subtract(min076).divide(max076.subtract(min076))).pow(ee.Number(2)).rename('FV076');
var FV075 =(ndvi075.subtract(min075).divide(max075.subtract(min075))).pow(ee.Number(2)).rename('FV076'); 
print(FV076, 'FV076');
print(FV075, 'FV075');


//Calculate the emissivity

var a= ee.Number(0.004);
var b= ee.Number(0.986);
var EM076=FV076.multiply(a).add(b).rename('EMM076');
var EM075=FV075.multiply(a).add(b).rename('EMM075');

Map.addLayer(EM076, {min: 0.9861084931770778, max:0.9863148295569912, palette: ['blue', 'white', 'green']},'EMM076');
Map.addLayer(EM075, {min: 0.9861084931770778, max:0.9863148295569912, palette: ['blue', 'white', 'green']},'EMM075');


//Calculate the LST
var LST076 = thermal076.expression('(Th/(1 + (0.00115* (Th / 1.438))*log(EM)))-273.15', {'Th': thermal076.select('B6'),'EM': EM076.select('EMM076')}).rename('LST076');
var LST075 = thermal075.expression('(Th/(1 + (0.00115* (Th / 1.438))*log(EM)))-273.15', {'Th': thermal075.select('B6'),'EM': EM075.select('EMM075')}).rename('LST075');

Map.addLayer(LST076, {min: 18.75399663475543, max:22.044924638925394, palette: ['red', 'white', 'yellow']},'LST076');
Map.addLayer(LST075, {min: 17.248831011523407, max:22.419531087340715, palette: ['red', 'white', 'yellow']},'LST075');
 
Export.image.toDrive({image: ndvi076, description: 'ndvi076', scale: 30, region: image076, fileFormat: 'GeoTIFF', formatOptions: {cloudOptimized: true}});
Export.image.toDrive({image: ndvi075, description: 'ndvi075', scale: 30, region: image075, fileFormat: 'GeoTIFF', formatOptions: {cloudOptimized: true}});

Map.addLayer(area);