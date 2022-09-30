//Function to calculate PCA
//From this link: https://www.lifeingis.com/computation-of-principal-components-analysis-in-the-google-earth-engine/#:~:text=Principal%20components%20analysis%20(PCA)%20is,the%20original%20image%20or%20dataset.
function PCA(maskedImage){
  var image = maskedImage.unmask()
  var scale = 5;
  var region = boundary2;
  var bandNames = image.bandNames();
  // Mean center the data to enable a faster covariance reducer
  // and an SD stretch of the principal components.
  var meanDict = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: region,
    scale: scale,
    maxPixels: 1e9,
    bestEffort: true,
    tileScale: 16
  });
  var means = ee.Image.constant(meanDict.values(bandNames));
  var centered = image.subtract(means);
  // This helper function returns a list of new band names.
  var getNewBandNames = function(prefix) {
    var seq = ee.List.sequence(1, bandNames.length());
    return seq.map(function(b) {
      return ee.String(prefix).cat(ee.Number(b).int());
    });
  };
  // This function accepts mean centered imagery, a scale and
  // a region in which to perform the analysis.  It returns the
  // Principal Components (PC) in the region as a new image.
  var getPrincipalComponents = function(centered, scale, region) {
    // Collapse the bands of the image into a 1D array per pixel.
    var arrays = centered.toArray();
    
    // Compute the covariance of the bands within the region.
    var covar = arrays.reduceRegion({
      reducer: ee.Reducer.centeredCovariance(),
      geometry: region,
      scale: scale,
      maxPixels: 1e9,
      bestEffort: true,
      tileScale: 16
    });

    // Get the 'array' covariance result and cast to an array.
    // This represents the band-to-band covariance within the region.
    var covarArray = ee.Array(covar.get('array'));

    // Perform an eigen analysis and slice apart the values and vectors.
    var eigens = covarArray.eigen();

    // This is a P-length vector of Eigenvalues.
    var eigenValues = eigens.slice(1, 0, 1);
    
    // Compute Percentage Variance of each component
    var eigenValuesList = eigenValues.toList().flatten()
    var total = eigenValuesList.reduce(ee.Reducer.sum())
    var percentageVariance = eigenValuesList.map(function(item) {
      return (ee.Number(item).divide(total)).multiply(100).format('%.2f')
    })
    // This will allow us to decide how many components capture
    // most of the variance in the input
    print('Percentage Variance of Each Component', percentageVariance)
    // This is a PxP matrix with eigenvectors in rows.
    var eigenVectors = eigens.slice(1, 1);
    // Convert the array image to 2D arrays for matrix computations.
    var arrayImage = arrays.toArray(1);

    // Left multiply the image array by the matrix of eigenvectors.
    var principalComponents = ee.Image(eigenVectors).matrixMultiply(arrayImage);

    // Turn the square roots of the Eigenvalues into a P-band image.
    var sdImage = ee.Image(eigenValues.sqrt())
      .arrayProject([0]).arrayFlatten([getNewBandNames('sd')]);

    // Turn the PCs into a P-band image, normalized by SD.
    return principalComponents
      // Throw out an an unneeded dimension, [[]] -> [].
      .arrayProject([0])
      // Make the one band array image a multi-band image, [] -> image.
      .arrayFlatten([getNewBandNames('pc')])
      // Normalize the PCs by their SDs.
      .divide(sdImage);
  };
  var pcImage = getPrincipalComponents(centered, scale, region);
  return pcImage.mask(maskedImage.mask());
}

// Add Layer to the map
print(L8_terrain)
Map.centerObject(L8_terrain)
Map.addLayer(L8_terrain, {bands:['b3', 'b2', 'b1'], min:7700, max: 10757}, 'L8_image');
Map.addLayer(L8_terrain, {bands:['b13'], min: 0.029, max: 6.28}, 'Aspect');
Map.addLayer(L8_terrain, {bands:['b14'], min: -31.56, max: 20.21, palette: ['ff2009','fcff40','3431ff']}, 'Convergence Index');
Map.addLayer(L8_terrain, {bands:['b15'], min: 120, max: 218, palette: ['ff2009','fcff40','3431ff']}, 'DEM');
Map.addLayer(L8_terrain, {bands:['b16'], min: 0, max: 5.02, palette: ['ff2009','fcff40','3431ff']}, 'LS-Factor');
Map.addLayer(L8_terrain, {bands:['b17'], min: -0.012, max: 0.007, palette: ['ff2009','fcff40','3431ff']}, 'Profile curvature');
Map.addLayer(L8_terrain, {bands:['b18'], min: 0.011, max: 1.01, palette: ['ff2009','fcff40','3431ff']}, 'Relative Slope Position');
Map.addLayer(L8_terrain, {bands:['b19'], min: 0.0074, max: 0.36, palette: ['ff2009','fcff40','3431ff']}, 'Slope');
Map.addLayer(L8_terrain, {bands:['b20'], min: 4.29, max: 19, palette: ['bcc1ff','6b70ff','070fff']}, 'TWI');


// Calculate PCA and add layer to the map
var L8_pca = PCA(L8_terrain).select(['pc1', 'pc2', 'pc3']);
var L8_comp = L8_terrain.addBands(L8_pca)
Map.addLayer(L8_pca, {bands: ['pc1', 'pc2', 'pc3']}, 'pca')
