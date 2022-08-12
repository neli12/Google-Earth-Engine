// Link to the code: https://code.earthengine.google.com/725e43472f3da494faa74dda930dbdf0
//Require geetools
var batch = require('users/fitoprincipe/geetools:batch');

//Download Sentinel

// Load Sentinel-2 Surface refelctance
var S2A_collection = ee.ImageCollection('COPERNICUS/S2_SR')  // 13 Dezembro 2018
                  .filterDate('2021-05-01', '2021-05-31')
                  .filterBounds(area)
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
                  .select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12'])
                  .sort('CLOUDY_PIXEL_PERCENTAGE');


print(S2A_collection); // number of images 

/********************************************************************************************
Calculate NDVI
*********************************************************************************************/ 

var addNDVI = function(img) {
  var ndvi = img.expression(
  '(nir-red)/(nir+red)', {
    'nir': img.select('B8A').divide(10000),
    'red': img.select('B4').divide(10000)}).rename('NDVI');
  return img.addBands(ndvi);
}

/********************************************************************************************
Calculate GNDVI
*********************************************************************************************/ 

var addGNDVI = function(img) {
  var ndvi = img.expression(
  '(nir-green)/(nir+green)', {
    'nir': img.select('B8A').divide(10000),
    'green': img.select('B3').divide(10000)}).rename('GNDVI');
  return img.addBands(ndvi);
}


/********************************************************************************************
Calculate NDRE
********************************************************************************************/

var addNDRE = function(img) {
  var ndre = img.expression(
  '(nir-red2)/(nir+red2)', {
    'nir': img.select('B8A').divide(10000),
    'red2': img.select('B6').divide(10000)}).rename('NDRE');
  return img.addBands(ndre);
}

/******************************************************************************************** 
Calculate NDWI
*********************************************************************************************/

var addNDMI = function(img) {
  var ndmi = img.expression(
  '(nir-swir1)/(nir+swir1)', {
    'nir': img.select('B8A').divide(10000),
    'swir1': img.select('B11').divide(10000)}).rename('NDMI');
  return img.addBands(ndmi);
}

/******************************************************************************************** 
Calculate EVI
*********************************************************************************************/
var addEVI = function(img) {
  var evi = img.expression(
    '2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1))', {
      'nir': img.select('B8A').divide(10000),
      'red': img.select('B4').divide(10000),
      'blue': img.select('B2').divide(10000)
    }).rename('EVI');
  return img.addBands(evi);
}

/******************************************************************************************** 
Calculate BSI
*********************************************************************************************/
var addBSI = function(img){
  var bsi = img.expression(
    '((swir1+red) - (nir + blue))/((swir1+red) + (nir + blue))', {
    'blue' : img.select('B2').divide(10000),
    'nir': img.select('B8A').divide(10000),
    'red' : img.select('B4').divide(10000),
    'swir1': img.select('B11').divide(10000)
    }).rename('BSI');
  return img.addBands(bsi);
}

    
/******************************************************************************************** 
Map over the collection
*********************************************************************************************/ 
var S2Awithindices = S2A_collection.map(addNDVI)
                            .map(addGNDVI)
                            .map(addNDRE)
                            .map(addNDMI)
                            .map(addEVI)
                            .map(addBSI);
print(S2Awithindices)

/********************************************************************************************
Add map to layer
********************************************************************************************/
Map.centerObject(area)
Map.addLayer(S2Awithindices, {bands: ['B4', 'B3', 'B2'], min: 156, max: 1470}, 'Image')
Map.addLayer(area, {}, 'Area');

/******************************************************************************************** 
Function to rename images to their acquisition date  -- From fitoprincipe user
*********************************************************************************************/
function collection_by_date(S2Awithindices) {
  var imlist = S2Awithindices.toList(S2Awithindices.size())
  var unique_dates = imlist.map(function(im){
    return ee.Image(im).date().format('YYYY-MM-dd')
  }).distinct()
  var collection_imlist = unique_dates.map(function(d) {
    d = ee.Date(d)
    var im = S2Awithindices.filterDate(d, d.advance(1, 'day'))
                           .mosaic()
  return im.set('system:time_start', d.millis(), 'system:id', d.format('YYYY-MM-dd'))
  })
  return ee.ImageCollection(collection_imlist)
}


var images_date = collection_by_date(S2Awithindices)
print(images_date)

batch.Download.ImageCollection.toDrive(images_date, 'S2A',  
              {scale: 20, region: area, name:'{system_date}', 
              fileFormat: 'GeoTIFF', crs: 'EPSG:4326', type: 'float'})
              
              
/***************************************************************************************
Mean reflectance
***************************************************************************************/
var S2A_mean = S2Awithindices.mean().toFloat().clip(area)
print(S2A_mean)

Map.addLayer(S2A_mean, {bands: ['B4', 'B3', 'B2'], min: 156, max: 1470}, 'Image_clip')

/***************************************************************************************
Export
***************************************************************************************/
Export.image.toDrive({image: S2A_mean, description: 'S2A_mean_2021_float', scale: 20,
  region: area, crs: 'EPSG:4326'
})

