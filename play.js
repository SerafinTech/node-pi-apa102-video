// Plays a video with sound on an led panel
// usage: sudo node play.js <filename>

const apa102video = require('./apa102video')

const videoScreen = new apa102video(botLeftSerpMatrix(24,24))

videoScreen.init()
  .then(() => videoScreen.createMp3(process.argv[2]))
  .then(mp3File => {
    const vid = videoScreen.playVideo(process.argv[2], {sound: mp3File, keepAspect: false})
    vid.on('end', () => {
      videoScreen.clearScreen()
      process.exit()
    })
  })
  .catch(err => { console.log(err)})

//function to help create led layout matrix with a panel laid out as follows
// -->-->-->-->-->
// ^
// <--<--<--<--<--  
//               ^
// -->-->-->-->-->
function botLeftSerpMatrix (width, height, numberOfLeds = width*height) {
  var matrix = []
  for (var n = 0; n < numberOfLeds; n++) {
    var col
    var row = height - Math.floor(n/width) - 1
    if(Math.floor((n/width) % 2)) {
      col = width - (n%width) - 1
    } else {
      col = n%width
    }
    if(matrix[row] === undefined) { matrix[row] = []}
    matrix[row][col] = n
  }
  return matrix
}