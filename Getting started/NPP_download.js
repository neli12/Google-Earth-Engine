//Load image collection and select the Npp band
var NPP = ee.ImageCollection('MODIS/006/MOD17A3H')
                  .filter(ee.Filter.date('2014-01-01', '2014-12-31'))
                  .filterBounds(geometry)
                  .select('Npp')
print(NPP);

// Convert to one single image and clip the raster                 
var NPP_clip = NPP.toBands()
                  .clip(geometry)
                  
print(NPP_clip);

// Visualization parameters
var vis_param = {
  min: 2800,
  max: 19000,
  palette: ['bbe029', '0a9501', '074b03'],
};

//Add layer to the map
Map.addLayer(NPP_clip, vis_param, 'NPP');

//Export image to Drive
Export.image.toDrive({image: NPP_clip,
                      description: 'NPP_2014',
                      crs: 'EPSG:4326'})