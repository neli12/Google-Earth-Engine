# Getting endmembers from earth surfaces
Hello everyone!  
In my learning process of the Google Earth Engine platform, I will present here all the codes and tutorials I am practicing with.  
This time, I bring here the code to get endmembers of Earth surfaces. This tutorial is presented in the collection of video tutorials of the GEE, which you can find here: https://developers.google.com/earth-engine/tutorials/videos. Thus, these are copy codes, not actually mine. But I wanted to present here and share my experience when I am learning.  You can find the code here: https://code.earthengine.google.com/d877983d4cc55d7472702d4ae71d018c.  
I run this code using an image from my country, Paraguay, as you can see from the images below. 


<img src="https://github.com/neli12/screenshots-figures/blob/main/image2.png" width="700" />

I selected three areas to represent bare soil, vegetation and water. The polygons were drawn in the code editor and then the mean was calculated using the reduceRegions() function. From this, we can see the "pure" spectra of each land cover class, considered the "endmember". Below is depicted in the figure the spectral behaviour of each class.

<img src="https://github.com/neli12/screenshots-figures/blob/main/image5.png" width="700" />

Those are then used to solve the "x" value in the equation A * x = B, where A represents the endmember, x are the unknowns fractions and B are the pixel values. This equation represent the "mixed pixels" and is used to represent the endmembers after solving the it. In other words, we are doing an spectral unmixing, assuming that each pixel is not pure and instead is a mixture of endmembers of different land covers.  
The resulting image, after obtaining the endmemners for each surface is depicted in the figure below. This is a specific area where the hydroelectric plant "Itaipu" shared with Paraguay and Brazil can be found. Areas with red colors represent bare soils, green represents vegetated areas and blue is the endmember for water.

<img src="https://github.com/neli12/screenshots-figures/blob/main/image4.png" width="700" />

Fortunately for us, we do not need all this process, with just a line of code it is possible to obtain the same results. The tutorial can be found here: https://developers.google.com/earth-engine/guides/image_transforms.  
And this is the code from the same link in GEE:


```
// Load a Landsat 5 image and select the bands we want to unmix.
var bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'];
var image = ee.Image('LANDSAT/LT05/C01/T1/LT05_044034_20080214')
  .select(bands);
Map.setCenter(-122.1899, 37.5010, 10); // San Francisco Bay
Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], min: 0, max: 128}, 'image');

// Define spectral endmembers.
var urban = [88, 42, 48, 38, 86, 115, 59];
var veg = [50, 21, 20, 35, 50, 110, 23];
var water = [51, 20, 14, 9, 7, 116, 4];

// Unmix the image.
var fractions = image.unmix([urban, veg, water]);
Map.addLayer(fractions, {}, 'unmixed');
```
