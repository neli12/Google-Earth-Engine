//Load soil layers, clip by geometry and reduce the layers to the mean
var sand = ee.Image("projects/soilgrids-isric/sand_mean")
             .clip(geometry)
             .reduce('sum')
             .select('sum').rename('sand');
var clay = ee.Image("projects/soilgrids-isric/clay_mean")
             .clip(geometry)
             .reduce('sum')
             .select('sum').rename('clay');
var cec = ee.Image("projects/soilgrids-isric/cec_mean")
             .clip(geometry)
             .reduce('sum')
             .select('sum').rename('cec');
var nitrogen = ee.Image("projects/soilgrids-isric/nitrogen_mean")
             .clip(geometry)
             .reduce('sum')
             .select('sum').rename('nitrogen');
var ph = ee.Image("projects/soilgrids-isric/phh2o_mean")
             .clip(geometry)
             .reduce('sum')
             .select('sum').rename('ph');
var soc = ee.Image("projects/soilgrids-isric/soc_mean")
             .clip(geometry)
             .reduce('sum')
             .select('sum').rename('soc');

//Add all the layers to a new image
var newBands = ee.Image([clay, cec, nitrogen, ph, soc]);

var col = sand.addBands(newBands);
print('Collection from list of images', col);


//Set visualization parameters
var imageVisParam = {"opacity":1,"min":10,"max":4000,"palette":["ffef29","0000ff"]};

//Add layer to the map
Map.addLayer(clay, imageVisParam)

//Export image
Export.image.toDrive({image: col, description: 'soil_mean'})