//Load soil layers, clip by geometry and reduce the layers to the mean
var sand = ee.Image("projects/soilgrids-isric/sand_mean")
             .reduce('mean')
             .select('mean').rename('sand')
             .float();

print(sand);
var clay = ee.Image("projects/soilgrids-isric/clay_mean")
             .reduce('mean')
             .select('mean').rename('clay')
             .float();
var cec = ee.Image("projects/soilgrids-isric/cec_mean")
             .reduce('mean')
             .select('mean').rename('cec')
             .float();
var nitrogen = ee.Image("projects/soilgrids-isric/nitrogen_mean")
             .reduce('mean')
             .select('mean').rename('nitrogen')
             .float();
var ph = ee.Image("projects/soilgrids-isric/phh2o_mean")
             .reduce('mean')
             .select('mean').rename('ph')
             .float();
var soc = ee.Image("projects/soilgrids-isric/soc_mean")
             .reduce('mean')
             .select('mean').rename('soc')
             .float();

//Add all the layers to a new image
var newBands = ee.Image([clay, cec, nitrogen, ph, soc]);

var col = sand.addBands(newBands);
print('Collection from list of images', col);


//Set visualization parameters
var imageVisParam = {"opacity":1,"min":10,"max":4000,"palette":["ffef29","0000ff"]};

//Add layer to the map
Map.addLayer(sand, imageVisParam)

//Export image
Export.image.toDrive({image: col, description: 'soil_mean_def',
  region: geometry
})
