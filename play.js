// Plays a video with sound on an led panel
// usage: sudo node play.js <filename>

const apa102video = require('./apa102video')

const videoScreen = new apa102video(botLeftSerpMatrix(24,24))

//PLAY VIDEO
//videoScreen.init()
//.then(() => videoScreen.createMp3(process.argv[2]))
//.then(mp3File => {
//  const vid = videoScreen.playVideo(process.argv[2], {sound: mp3File, keepAspect: false})
//  vid.on('end', () => {
//    videoScreen.clearScreen()
//    process.exit()
//  })
//})
//.catch(err => { console.log(err)})

//STREAM WEB CAM
//videoScreen.init()
//.then(() => {
//  console.log('init complete')
//  const video = videoScreen.playCam('/dev/video0')
//})
//.catch(err => { console.log(err)})

//PLAY GIF
//videoScreen.init()
//.then(() => {
//  const video = videoScreen.playGif(process.argv[2])
//})
//



//function to help create led layout matrix with a panel laid out as follows
// -->-->-->-->-->
// ^
// <--<--<--<--<--  
//               ^
// -->-->-->-->-->
function botLeftSerpMatrix (width, height, numberOfLeds = width*height) {
  let matrix = []
  for (let n = 0; n < (width * height); n++) {
    let col
    let row = height - Math.floor(n/width) - 1
    if(Math.floor((n/width) % 2)) {
      col = width - (n%width) - 1
    } else {
      col = n%width
    }
    if(matrix[row] === undefined) { matrix[row] = []}
    if(n < numberOfLeds) {
      matrix[row][col] = n
    } else {
      matrix[row][col] = -1
    }  
  }
  return matrix
}