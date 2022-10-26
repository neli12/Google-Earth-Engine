Link to the code: https://code.earthengine.google.com/57cd03db36c00188d7227683f376f255
//Import SIAC module
var siac = require('users/marcyinfeng/utils:SIAC');

// Load Sentinel-2 TOA refectance and select the least cloudy image
var S2A_image = ee.ImageCollection('COPERNICUS/S2')
                  .filterDate('2016-07-01', '2016-07-31')
                  .filterBounds(geometry)
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 60))
                  .sort('CLOUDY_PIXEL_PERCENTAGE')
                  .first();

print(S2A_image);
Map.addLayer(S2A_image, {bands: ['B4', 'B3', 'B2'], min: 156, max: 1470}, 'Image_clip')

// Use the SIAC module to correct the image
var S2_boa = siac.get_sur(S2A_image); 
print(S2_boa);

Map.addLayer(S2_boa, {bands: ['B4', 'B3', 'B2'], min: 0.02, max: 0.2125}, 'Image_clip_boa')

 /********************************************************************************************
Calculate NDVI
*********************************************************************************************/ 
var ndvi = S2_boa.expression(
  '(nir-red)/(nir+red)', {
    'nir': S2_boa.select('B8A').divide(10000),
    'red': S2_boa.select('B4').divide(10000)}).rename('NDVI');

/********************************************************************************************
Calculate GNDVI
*********************************************************************************************/ 
var gndvi = S2_boa.expression(
  '(nir-green)/(nir+green)', {
    'nir': S2_boa.select('B8A').divide(10000),
    'green': S2_boa.select('B3').divide(10000)}).rename('GNDVI');

/********************************************************************************************
Calculate NDRE
********************************************************************************************/
var ndre = S2_boa.expression(
  '(nir-red2)/(nir+red2)', {
    'nir': S2_boa.select('B8A').divide(10000),
    'red2': S2_boa.select('B6').divide(10000)}).rename('NDRE');

/******************************************************************************************** 
Calculate NDWI
*********************************************************************************************/
var ndmi = S2_boa.expression(
  '(nir-swir1)/(nir+swir1)', {
    'nir': S2_boa.select('B8A').divide(10000),
    'swir1': S2_boa.select('B11').divide(10000)}).rename('NDMI');

/******************************************************************************************** 
Calculate EVI
*********************************************************************************************/
var evi = S2_boa.expression(
  '2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1))', {
    'nir': S2_boa.select('B8A').divide(10000),
    'red': S2_boa.select('B4').divide(10000),
    'blue': S2_boa.select('B2').divide(10000)}).rename('EVI');

/******************************************************************************************** 
Calculate BSI
*********************************************************************************************/
var bsi = S2_boa.expression(
  '((swir1+red) - (nir + blue))/((swir1+red) + (nir + blue))', {
    'blue' : S2_boa.select('B2').divide(10000),
    'nir': S2_boa.select('B8A').divide(10000),
    'red' : S2_boa.select('B4').divide(10000),
    'swir1': S2_boa.select('B11').divide(10000)
    }).rename('BSI');
    
/******************************************************************************************** 
Adds bands to the image
*********************************************************************************************/ 
var S2Awithindices = S2_boa.addBands(ndvi)
                            .addBands(gndvi)
                            .addBands(ndre)
                            .addBands(ndmi)
                            .addBands(evi)
                            .addBands(bsi);
                            
var S2A_def = S2Awithindices.select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12',
'NDVI', 'NDRE', 'GNDVI', 'NDMI', 'EVI', 'BSI'])
print(S2A_def)

/********************************************************************************************
Add map to layer
********************************************************************************************/
Map.centerObject(geometry,11)
Map.addLayer(S2A_def, {bands: ['NDVI'], min: 0.4, max: 0.92, palette: ['ff1307','fcff29','4dff21']}, 'NDVI')

/*********************************************************************************************
 * Export images
 * ******************************************************************************************/
var S2A_clip = S2A_def.clip(geometry)
Map.centerObject(geometry,11)
Map.addLayer(S2A_clip, {bands: ['NDVI'], min: 0.4, max: 0.92, palette: ['ff1307','fcff29','4dff21']}, 'NDVI')
Export.image.toDrive({image: S2A_clip, description: 'S2A_july', crs: 'EPSG:27700', scale: 20})
