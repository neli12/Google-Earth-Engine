// Create a multi-part feature.
var multiPoint = ee.Geometry.MultiPoint([[-46.08, -8.58], [-46.1161, -11.646], [-46.1168, -13.348]]);
print(multiPoint)

Map.addLayer(multiPoint);

//Load image collection and select the Npp band
var NPP = ee.ImageCollection('MODIS/006/MOD17A3HGF')
                  .filter(ee.Filter.date('2000-01-01', '2021-12-31'))
                  .filterBounds(geometry)
                  .select('Npp')
print(NPP);

// Calculate the mean and clip the raster                 
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
Map.addLayer(NPP, vis_param, 'NPP');

//Export image to Drive
Export.image.toDrive({image: NPP,
                      description: 'NPP_2000_2021_iv',
                      region: geometry,
                      crs: 'EPSG:4326'
})
