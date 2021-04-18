// var img = new Image();
// img.crossOrigin = 'anonymous';
// img.src = 'https://i.imgur.com/F4ww2He.jpg';

const canvas = document.getElementById('canvas-id');
const ctx = canvas.getContext('2d');
const video = document.querySelector('video');
var constraints = {video: { facingMode: "user" }, audio: false};
const width = 128;
const height = 112;
canvas.width = width;
canvas.height = height;
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const getMedia = () => {
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(mediaStream) {
    video.srcObject = mediaStream;
    video.onloadedmetadata = function(e) {
      video.play();
    };
  })
  .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.
}

getMedia();

video.addEventListener('play', () => {
  const step = () => {
    return setInterval(() => {
      let [drawingHeight, drawingWidth] = scaleImage(video);
      let xOffset = canvas.width / 2 - drawingWidth / 2;
      let yOffset = canvas.height / 2 - drawingHeight / 2;
      ctx.drawImage(video, xOffset, yOffset, drawingWidth, drawingHeight);
      colourOrderedDithering(gbNB, ctx, width, height);
    }, 200);
    // requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
});

const switchCamera = () => {
  switch (constraints.video.facingMode) {
    case "user":
      constraints.video = { facingMode: "environment" };
      break
    case "environment":
      constraints.video = { facingMode: "user" };
  }
  getMedia();
}

const scaleImage = (image) => {
  let newHeight, newWidth
  if (image.videoWidth > image.videoHeight) {
    newHeight = height;
    newWidth = (image.videoWidth * height) / image.videoHeight;
  } else {
    newWidth = width;
    newHeight = (image.videoHeight * width) / image.videoWidth;
  }
  return [newHeight, newWidth];
}

const setImageWidth = (originalHeight, originalWidth, newHeight) => {
  return Math.floor((originalWidth * newHeight) / originalHeight);
}

// img.onload = function() {
//     imgWidth = img.naturalWidth;
//     imgHeight = img.naturalHeight;
//     newWidth = setImageWidth(imgHeight, imgWidth, height);
//     var wrh = img.width / img.height;
//     var centerWidth = canvas.width;
//     var centerHeight = centerWidth / wrh;
//     if (centerHeight > canvas.height) {
//       centerHeight = canvas.height;
//       centerWidth = centerHeight * wrh;
//     }
//     var xOffset = -(centerWidth < canvas.width ? ((canvas.width - centerWidth) / 2) : 0);
//     var yOffset = -(centerHeight < canvas.height ? ((canvas.height - centerHeight) / 2) : 0);
//     ctx.drawImage(img,yOffset,xOffset,newWidth,height);
//     // colourOrderedDithering(gbNB);
// };



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

  var thresholdPalette = [
    [1, 7, 4],
    [5, 8, 3],
    [6, 2, 9]
  ];

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



// var nearestPaletteColour = function() {
//   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//   const data = imageData.data;

//   const gbColors = [
//     [15, 56, 15],
//     [48, 98, 48],
//     [139, 172, 15],
//     [155, 188, 15]
//   ]

//   var distanceColours = function(colour, colourToMatch) {
//     return Math.sqrt(Math.pow((colour[0] - colourToMatch[0]), 2) + Math.pow((colour[1] - colourToMatch[1]), 2) + Math.pow((colour[2] - colourToMatch[2]), 2));
//   }


//   for (var i = 0; i < data.length; i += 4) {
//     var currentPixel = [data[i], data[i + 1], data[i + 2]]
//     var shortestMatch = Number.MAX_VALUE;
//     var paletteIndex = 0;
//     for (var j = 0; j < gbColors.length; j++) {
//       var closestMatch = distanceColours(currentPixel, gbColors[j]);
//       if (closestMatch < shortestMatch) {
//         shortestMatch = closestMatch;
//         paletteIndex = j;
//       }
//     }
//     data[i]     = gbColors[paletteIndex][0];
//     data[i + 1] = gbColors[paletteIndex][1];
//     data[i + 2] = gbColors[paletteIndex][2];
//   }
//   ctx.putImageData(imageData, 0, 0);
// }





const gbGreens = [
  [15, 56, 15],
  [48, 98, 48],
  [139, 172, 15],
  [155, 188, 15]
]

const gbNB = [
  [0, 0, 0],
  [86, 86, 86],
  [172, 172, 172],
  [255, 255, 255]
]

const colourOrderedDithering = (colourPalette) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  var thresholdPaletteEightByEight = [ 
    [ 0, 32,  8, 40,  2, 34, 10, 42],   /* 8x8 Bayer ordered dithering  */
    [48, 16, 56, 24, 50, 18, 58, 26],   /* pattern.  Each input pixel   */
    [12, 44,  4, 36, 14, 46,  6, 38],   /* is scaled to the 0..63 range */
    [60, 28, 52, 20, 62, 30, 54, 22],   /* before looking in this table */
    [ 3, 35, 11, 43,  1, 33,  9, 41],   /* to determine the action.     */
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47,  7, 39, 13, 45,  5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21] ];

  const distanceColours = (colour, colourToMatch) => {
    return Math.sqrt(Math.pow((colour[0] - colourToMatch[0]), 2) + Math.pow((colour[1] - colourToMatch[1]), 2) + Math.pow((colour[2] - colourToMatch[2]), 2));
  }

  for (let i = 0; i < data.length; i += 4) {
 
    let x = ((i / 4) % canvas.width) % thresholdPaletteEightByEight.length;
    let y = (Math.floor((i / 4) / canvas.width)) % thresholdPaletteEightByEight.length;

    let preCalculatedThreshold = (thresholdPaletteEightByEight[y][x] * 1/64) - 0.5
    let redPixel   = data[i]     + (255/colourPalette.length) * preCalculatedThreshold;
    let bluePixel  = data[i + 1] + (255/colourPalette.length) * preCalculatedThreshold;
    let greenPixel = data[i + 2] + (255/colourPalette.length) * preCalculatedThreshold;
    let fullPixel  = [redPixel, bluePixel, greenPixel];

    let shortestMatch = Number.MAX_VALUE;
    let paletteIndex = 0;

    for (let j = 0; j < colourPalette.length; j++) {
      let closestMatch = distanceColours(fullPixel, colourPalette[j]);
      if (closestMatch < shortestMatch) {
        shortestMatch = closestMatch;
        paletteIndex = j;
      }
    }

    data[i]     = colourPalette[paletteIndex][0];
    data[i + 1] = colourPalette[paletteIndex][1];
    data[i + 2] = colourPalette[paletteIndex][2];

  }
  ctx.putImageData(imageData, 0, 0);
}

const pauseVideo = () => {
  video.pause();
  toggleButton("pause");
}

const playVideo = () => {
  video.play();
  toggleButton("play");
}

// Working version for Browser
// const saveStill = () => {
//   let image = new Image();
//   image.src = canvas.toDataURL("image/jpeg", 1.0);
//   const link = document.createElement("a");
//   link.setAttribute('href', image.src);
//   link.setAttribute("download", "gameboycameralive_picture");
//   link.click();
// }

// open a new page where I can download the picture
// const saveStill = () => {
//   let image = new Image();
//   image.src = canvas.toDataURL("image/jpeg", 1.0);
//   var w = window.open("");
//   w.document.write(image.outerHTML);
// }

// Create a new img tag and display the photo taken and can save from there
const saveStill = () => {
  const image = document.createElement("img");
  image.src = canvas.toDataURL("image/jpeg", 1.0);
  const gbPicture = document.getElementById('image-gallery').appendChild(image);
  gbPicture.classList.add("gameboy-picture");
}

const hideButton = (buttonName) => {
  return buttonName.classList.add("hide-element");
}

const showButton = (buttonName) => {
  return buttonName.classList.remove("hide-element");
}

const toggleButton = (current) => {
  const pauseButton = document.getElementById("pause-button");
  const saveButton = document.getElementById("save-button");
  const discardButton = document.getElementById("discard-button");
  const switchButton = document.getElementById("switch-button");
  if (current === "pause") {
      hideButton(pauseButton);
      hideButton(switchButton);
      showButton(saveButton);
      showButton(discardButton);
  } else {
      hideButton(saveButton);
      hideButton(discardButton);
      showButton(pauseButton);
      showButton(switchButton);
  }
}
