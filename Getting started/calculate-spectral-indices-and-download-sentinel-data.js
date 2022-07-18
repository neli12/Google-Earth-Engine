// Link to the code: https://code.earthengine.google.com/de5e291103b5ae983f884c73ddf74652
//Require geetools
var batch = require('users/fitoprincipe/geetools:batch');


// Load Sentinel-2 TOA reflectance data.
var S2A_collection = ee.ImageCollection('COPERNICUS/S2_SR')
                  .filterDate('2021-12-01', '2021-12-31')
                  .filterBounds(geometry)
                  //.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 60))
                  //.select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12']);


print(S2A_collection); // number of images 

// Select the images and the spectral bands

var s2a_300321 = ee.Image('COPERNICUS/S2_SR/20210330T112109_20210330T112112_T30UVB')
                  .select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12'])
var s2a_130621 = ee.Image('COPERNICUS/S2_SR/20210613T112111_20210613T112447_T30UVB')
                   .select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12'])
var s2a_180721 = ee.Image('COPERNICUS/S2_SR/20210718T112119_20210718T112115_T30UVB')
                   .select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12'])
var s2a_060921 = ee.Image('COPERNICUS/S2_SR/20210906T112109_20210906T112110_T30UVB')
                   .select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12'])
var s2a_251121 = ee.Image('COPERNICUS/S2_SR/20211125T112319_20211125T112313_T30UVB')
                   .select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12'])
var s2a_051221 = ee.Image('COPERNICUS/S2_SR/20211205T112339_20211205T112443_T30UVB')
                   .select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12']);

// Convert the list of images into an image collection.
var S2AColl = ee.ImageCollection.fromImages([s2a_300321, 
                                         s2a_130621, 
                                         s2a_180721, 
                                         s2a_060921, 
                                         s2a_251121, 
                                         s2a_051221]);
                                         
print('Collection from list of images', S2AColl);

/***********************************
Calculate NDVI
***********************************/ 

var addNDVI = function(img) {
  var ndvi = img.expression(
  '(nir-red)/(nir+red)', {
    'nir': img.select('B8A').divide(10000),
    'red': img.select('B4').divide(10000)}).rename('NDVI');
  return img.addBands(ndvi);
}

/***********************************
Calculate GNDVI
***********************************/ 

var addGNDVI = function(img) {
  var ndvi = img.expression(
  '(nir-green)/(nir+green)', {
    'nir': img.select('B8A').divide(10000),
    'green': img.select('B3').divide(10000)}).rename('GNDVI');
  return img.addBands(ndvi);
}


/***********************************
Calculate NDRE
***********************************/ 

var addNDRE = function(img) {
  var ndre = img.expression(
  '(nir-red2)/(nir+red2)', {
    'nir': img.select('B8A').divide(10000),
    'red2': img.select('B5').divide(10000)}).rename('NDRE');
  return img.addBands(ndre);
}

/***********************************
Calculate NDWI
***********************************/ 

var addNDMI = function(img) {
  var ndmi = img.expression(
  '(nir-swir1)/(nir+swir1)', {
    'nir': img.select('B8A').divide(10000),
    'swir1': img.select('B11').divide(10000)}).rename('NDMI');
  return img.addBands(ndmi);
}

/***********************************
Calculate EVI
***********************************/ 
var addEVI = function(img) {
  var evi = img.expression(
    '2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1))', {
      'nir': img.select('B8A').divide(10000),
      'red': img.select('B4').divide(10000),
      'blue': img.select('B2').divide(10000)
    }).rename('EVI');
  return img.addBands(evi);
}

/***********************************
Calculate BSI
***********************************/ 
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


/***********************************
Calculate DATE
***********************************/ 
var addDate = function(img){
  var img_date = ee.Date(img.date());
  var img_date1 = ee.Number.parse(img_date.format('YYYMMdd'));
  return img.addBands(ee.Image(img_date1).rename('date').toInt())
}
 
    
/****************************************
Map over the collection
****************************************/ 
var S2Awithindices = S2AColl.map(addNDVI)
                            .map(addGNDVI)
                            .map(addNDRE)
                            .map(addNDMI)
                            .map(addEVI)
                            .map(addBSI)
                            .map(addDate);
print(S2Awithindices)


//Export
Export.image.toDrive({image: s2a_051221, description: 'S2A_051221', scale: 20,
  region: geometry, crs: 'EPSG:4326'
})


// Function to rename images to their acquisition date  -- From fitoprincipe user
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

batch.Download.ImageCollection.toDrive(images_date, 'S2A_RR',  
              {scale: 20, region: geometry, name:'{system_date}', fileFormat: 'GeoTIFF', crs: 'EPSG:4326', type: 'float'})
