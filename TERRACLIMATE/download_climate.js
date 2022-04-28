// Load shapefile
var counties = ee.FeatureCollection('users/neli92/counties')
print(counties);

//Require geetools
var batch = require('users/fitoprincipe/geetools:batch');

//Load Terraclimate data and select five climate variables
var dataset = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
                  .filter(ee.Filter.date('2016-01-01', '2020-12-31'))
                  .filterBounds(geometry)
                  .select('tmmx', 'aet', 'pr', 'ro', 'soil');
                  
//Create a function to clip images                  
function clp(img) {
  return img.clip(geometry)
}

//Clip images
var clipped_collection = dataset.map(clp)
print(clipped_collection)

//Convert images to bands 
var tmmx = clipped_collection.select('tmmx')
var tmmx_bands = tmmx.toBands()
var aet = clipped_collection.select('aet')
var aet_bands = aet.toBands()
var pr = clipped_collection.select('pr')
var pr_bands = pr.toBands()
var ro = clipped_collection.select('ro')
var ro_bands = ro.toBands()
var soil = clipped_collection.select('soil')
var soil_bands = soil.toBands()


//Download images
batch.Download.ImageCollection.toDrive(clipped_collection, 'climate',  
              {fileFormat: 'GeoTIFF', crs: 'EPSG:4326', type: 'float'})
  

//Alternatively, export scene to drive
//Export.image.toDrive({image: tmmx_bands, 
  //                    description: "tmmx_bands", region: geometry,
    //                  crs: 'EPSG:4326', maxPixels: 1835012515})
  