//Download using coordinates  
//Set the polygon or coordinates of your study area and add to the map
var geometry = ee.Geometry.Rectangle({coords: [-48.09866, -23.12806, -47.38219, -22.44259], geodesic: false});

// Load the Sentinel-1 ImageCollection.
var S1 = ee.ImageCollection('COPERNICUS/S1_GRD')
                  .filterBounds(geometry);
print(S1);

// Filter by metadata properties.
var S1_VH = S1.filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
                     .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                     .filter(ee.Filter.eq('instrumentMode', 'IW'));

print(S1_VH, 'Sentinel 1 filtered');

// Filter to get images from different look angles.
var vhAscending = S1_VH.filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));
var vhDescending = S1_VH.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));

// Create a composite from means at different polarizations and look angles.
var composite = ee.Image.cat([vhAscending.select('VH').mean(),
                ee.ImageCollection(vhAscending.select('VV').merge(vhDescending.select('VV'))).mean(),
                vhDescending.select('VH').mean()]).focal_median();
                
print(composite);

// Display as a composite of polarization and backscattering characteristics.
Map.addLayer(composite, {min: [-17], max: [-9]}, 'composite');