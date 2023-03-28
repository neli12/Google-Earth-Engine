Link: https://code.earthengine.google.com/cd34af3d6ad39d4999d2d2610e28f003
var bbox = ee.Geometry.Rectangle({coords: [-54.9144472200180971,-17.0770074996950001, -54.8444422002885972,-17.0506326361065987], geodesic: false});
var S2A_Image = ee.Image('COPERNICUS/S2/20220811T134709_20220811T135649_T21KYB')
                  .select(['B2', 'B3', 'B4', 'B8A'])
                  .clip(bbox)
                  
Map.addLayer(S2A_Image, {bands: ['B4', 'B3', 'B2'], min: 1401, max: 2691});
                  
var bands = ['B2', 'B3', 'B4', 'B8A']

//Merge land cover classifications into one feature class
var newLULC = Trees.merge(Grass);
print(newLULC)
 
//Make training data by 'overlaying' the points on the image.
var points = S2A_Image.sampleRegions({
  collection: newLULC, 
  properties: ['Value'], 
  scale: 10, geometries: true
 }).randomColumn();    
 
//print(points)

Export.table.toDrive({collection:points, description: 'points'})
Export.table.toAsset({collection:points, description: 'pointsLULCIzabelFarm'})

//Randomly split the samples to set some aside for testing the model's accuracy
//using the "random" column. Roughly 80% for training, 20% for testing.
var split = 0.8;
var training = points.filter(ee.Filter.lt('random', split));
var testing = points.filter(ee.Filter.gte('random', split));
print(testing);


//Print these variables to see how much training and testing data you are using
print('Samples n =', points.aggregate_count('.all'));
print('Training n =', training.aggregate_count('.all'));
print('Testing n =', testing.aggregate_count('.all'));

//******Part 4: Random Forest Classification and Accuracy Assessments******
//////////////////////////////////////////////////////////////////////////

//Run the RF model using 300 trees and 5 randomly selected predictors per split ("(300,5)"). 
//Train using bands and land cover property and pull the land cover property from classes
var classifier = ee.Classifier.smileRandomForest(300,2).train({
  features: training,
  classProperty: 'Value',
  inputProperties: bands
});

//Test the accuracy of the model
////////////////////////////////////////

//Print Confusion Matrix and Overall Accuracy
var confusionMatrix = classifier.confusionMatrix();
print('Confusion matrix: ', confusionMatrix);
print('Training Overall Accuracy: ', confusionMatrix.accuracy());
var kappa = confusionMatrix.kappa();
print('Training Kappa', kappa);
 
var validation = testing.classify(classifier);
var testAccuracy = validation.errorMatrix('landcover', 'classification');
print('Validation Error Matrix RF: ', testAccuracy);
print('Validation Overall Accuracy RF: ', testAccuracy.accuracy());
var kappa1 = testAccuracy.kappa();
print('Validation Kappa', kappa1);

//Apply the trained classifier to the image
var classified = S2A_Image.select(bands).classify(classifier);
Map.addLayer(classified, {min: 1, max: 2})
