// This is a basic tutorial on how to download surface reflectance images from Landsat-8 mission (https://code.earthengine.google.com/098912d8d9653d1d2f29732ac322db07)
// These images are already atmospherically corrected and do not need preprocessing.
// I will give two examples: i) one using coordinates to select an area from which images will be downloaded
// and ii) using the entire scene. Let's start!

//Download using coordinates  
//Set the polygon or coordinates of your study area and add to the map
var geometry = ee.Geometry.Rectangle({coords: [-48.09866, -23.12806, -47.38219, -22.44259], geodesic: false});
                                    
Map.addLayer(geometry, {color: 'gray'}, 'area');
Map.centerObject(geometry, 10);  // the higher the value, the greater the zoom in

//Load an image collection from Landsat 8 images in surface reflectance
//Consider the period from March to May 2021.
//Filter by clouds and select those with less than 10% clouds

var L8Collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                 .filterDate('2021-03-01', '2021-05-31')
                 .filterMetadata('CLOUD_COVER', 'less_than', 10)
                 .filterBounds(geometry);
print(L8Collection);

//Select the median image, six reflectance bands and clip by geometry
var L8clip = L8Collection.median()
                         .clip(geometry)
                         .select('SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7');
Map.addLayer(L8clip, {bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 7900, max: 10660}, 'L8clip')

//Export image to drive
Export.image.toDrive({image: L8clip, 
                      description: "L8_clip_example",
                      scale: 30,
                      crs: 'EPSG:4326'})
                      
//////////////////////////////////////////////////////////////////////////////////////////////////

//Download a scene
//Select the image by scene
var L8scene = ee.Image('LANDSAT/LC08/C02/T1_L2/LC08_220076_20210509')
                .select('SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7');
                
Map.addLayer(L8scene, {bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 7900, max: 10660}, 'L8scene')

//Export scene to drive
Export.image.toDrive({image: L8scene, 
                      description: "L8_scene_example",
                      scale: 30,
                      crs: 'EPSG:4326'})
