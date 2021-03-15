var img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'https://i.imgur.com/F4ww2He.jpg';

var canvas = document.getElementById('image-ici');
canvas.height = 333;
canvas.width = 500;

var ctx = canvas.getContext('2d');

img.onload = function() {
    ctx.drawImage(img, 0, 0);
    // grayscale();
    // blackOrWhite();
    // randomDithering();
    // orderedDitheringThreeByThreeClustered();
    orderedDitheringFourByFour();
};

var grayscale = function() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (var i = 0; i < data.length; i += 4) {
    var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i]     = avg; // red
    data[i + 1] = avg; // green
    data[i + 2] = avg; // blue
  }
  ctx.putImageData(imageData, 0, 0);
};

var blackOrWhite = function() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (var i = 0; i < data.length; i += 4) {
    var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (avg >= 128) {
      data[i]     = 255; // red
      data[i + 1] = 255; // green
      data[i + 2] = 255; // blue
    } else {
      data[i]     = 0; // red
      data[i + 1] = 0; // green
      data[i + 2] = 0; // blue
    }
  }
  ctx.putImageData(imageData, 0, 0);
};


// For each dot in our grayscale image, we generate
// a random number in the range 0 - 255: if the random number is greater than
// the image value at that dot, the display device plots the dot white;
// otherwise, it plots it black.

var randomDithering = function() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (var i = 0; i < data.length; i += 4) {
    var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    var random = Math.floor(Math.random() * Math.floor(256));
    if (avg >= random) {
      data[i]     = 255; // red
      data[i + 1] = 255; // green
      data[i + 2] = 255; // blue
    } else {
      data[i]     = 0; // red
      data[i + 1] = 0; // green
      data[i + 2] = 0; // blue
    }
  }
  ctx.putImageData(imageData, 0, 0);
};

// THE IMAGE DOT IS MAPPED ONLY TO ONE PIXEL IN THE
// PATTERN.  Returning to our example of a 3 x 3 pattern, this means that we
// would be mapping NINE image dots into this pattern.

// The simplest way to do this in programming is to map the X and Y coordinates
// of each image dot into the pixel (X mod 3, Y mod 3) in the pattern.

// we can derive an effective mathematical algorithm that can be used to plot
// the correct pixel patterns.  Because each of the patterns above is a
// superset of the previous, we can express the patterns in a compact array
// form as the order of pixels added.

// given an index position of a pixel how do I get the x,y coordinates
// scale 

var orderedDitheringThreeByThreeClustered = function() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  var thresholdPalette = [
    [8, 3, 4],
    [6, 1, 2],
    [7, 5, 9]
  ];

  // var thresholdPalette = [
  //   [1, 7, 4],
  //   [5, 8, 3],
  //   [6, 2, 9]
  // ];

  var scaleThreshold = function(threshold) {
    return Math.round(threshold * (255/ thresholdPalette.flat().length));
  }

  newThreshold = thresholdPalette.map(palette => palette.map(scaleThreshold));

  for (var i = 0; i < data.length; i += 4) {
 
    var x = ((i / 4) % canvas.width) % 3;
    var y = (Math.floor((i / 4) / canvas.width)) % 3;

    var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

    if (avg >= newThreshold[y][x]) {
      data[i]     = 255; // red
      data[i + 1] = 255; // green
      data[i + 2] = 255; // blue
    } else {
      data[i]     = 0; // red
      data[i + 1] = 0; // green
      data[i + 2] = 0; // blue
    }
  }
  ctx.putImageData(imageData, 0, 0);
}






var orderedDitheringFourByFour = function() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  var thresholdPaletteEightByEight = [ 
    [0, 32,  8, 40,  2, 34, 10, 42],   /* 8x8 Bayer ordered dithering  */
    [48, 16, 56, 24, 50, 18, 58, 26],   /* pattern.  Each input pixel   */
    [12, 44,  4, 36, 14, 46,  6, 38],   /* is scaled to the 0..63 range */
    [60, 28, 52, 20, 62, 30, 54, 22],   /* before looking in this table */
    [ 3, 35, 11, 43,  1, 33,  9, 41],   /* to determine the action.     */
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47,  7, 39, 13, 45,  5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21] ];

  var scaleThreshold = function(threshold) {
    return Math.round(threshold * (255/ thresholdPaletteEightByEight.flat().length));
  }

  newThreshold = thresholdPaletteEightByEight.map(palette => palette.map(scaleThreshold));

  for (var currentPixel = 0; currentPixel < data.length; currentPixel += 4) {
 
    var x = ((currentPixel / 4) % canvas.width) % thresholdPaletteEightByEight.length;
    var y = (Math.floor((currentPixel / 4) / canvas.width)) % thresholdPaletteEightByEight.length;

    var avg = (data[currentPixel] + data[currentPixel + 1] + data[currentPixel + 2]) / 3;

    if (avg >= newThreshold[y][x]) {
      data[currentPixel]     = 255; // red
      data[currentPixel + 1] = 255; // green
      data[currentPixel + 2] = 255; // blue
    } else {
      data[currentPixel]     = 0; // red
      data[currentPixel + 1] = 0; // green
      data[currentPixel + 2] = 0; // blue
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
