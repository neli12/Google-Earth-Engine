//Require geetools
var batch = require('users/fitoprincipe/geetools:batch');

//Set coordinates of the area of interest and add to the map
var geometry = ee.Geometry.Rectangle({coords: [-48.0986639999999994,-23.1280615139999988, -47.3821904440000026,-22.4425970799999988], geodesic: false});
Map.addLayer(geometry)

//Select start and finish dates and the tile number
var start = ee.Date('2019-04-04');
var finish = ee.Date('2019-05-19');
var MGRS_TILE1 = '22KHV';

// Load Sentinel-2 TOA reflectance data.
var S2A_collection = ee.ImageCollection('COPERNICUS/S2_SR')     // Select all the images
                       .filterDate(start, finish)              // Filter by start and finish date
                       .filterBounds(geometry)                  //Filter by geometry
                       .filterMetadata('MGRS_TILE', 'equals', MGRS_TILE1)     //Filter by tiles
                       .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));  //Filter by cloud cover (> 10%)

print(S2A_collection); // print number of images 

// Select spectral bands
var selected_bands = ['Blue', 'Green', 'Red', 'Red_Edge_1', 
                'Red_Edge_2', 'Red_Edge_3','NIR', 'B8A', 'SWIR_1', 'SWIR_2'];

// Rename bands
var S2A_BANDS = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 
                'B8A', 'B11', 'B12'];

var S2A_NAMES = ['Blue', 'Green', 'Red', 'Red_Edge_1', 
                'Red_Edge_2', 'Red_Edge_3', 'NIR', 'B8A', 'SWIR_1', 'SWIR_2'];

var S2A_collection = S2A_collection.map(function(img) {
  return img.select(S2A_BANDS, S2A_NAMES);
});

var S2A_collection = S2A_collection.map(function(img) {
  return img.select(selected_bands);
});

print(S2A_collection)


// Function to rename images to their acquisition date  -- From fitoprincipe user
function mosaicByDate(S2A_collection){
  var imlist = S2A_collection.toList(S2A_collection.size())
  var unique_dates = imlist.map(function(im){
    return ee.Image(im).date().format("YYYY-MM-dd")
  }).distinct()
  var mosaic_imlist = unique_dates.map(function(d){
    d = ee.Date(d)
    var im = S2A_collection.filterDate(d, d.advance(1, "day"))
                           .mosaic()
  return im.set("system:time_start", d.millis(), "system:id", d.format("YYYY-MM-dd"))
 })
  return ee.ImageCollection(mosaic_imlist)
}

var images_date = mosaicByDate(S2A_collection)
print(images_date)

batch.Download.ImageCollection.toDrive(images_date, 'S2A_22KHV',  
              {scale: 10, region: bbox, name:'{system_date}', fileFormat: 'GeoTIFF', crs: 'EPSG:4326', type: 'float'})
              
//
