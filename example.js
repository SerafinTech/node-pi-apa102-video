const LedVideo = require('./index.js')
const AudioPlayer = require('serafintech-player')

const matrix = [
  [191,190,189,188,187,186,185,184,183,182,181,180,179,178,177,176,175,174,173,172,171,170,169,168],
  [144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167],
  [143,142,141,140,139,138,137,139,135,134,133,132,131,130,129,128,127,126,125,124,123,122,121,120],
  [96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119],
  [95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72],
  [48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71],
  [47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24],
  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
]
const audioTrack = new AudioPlayer(process.argv[3])

const player = new LedVideo(matrix, 100, 20)

player.play(process.argv[2])

player.on('videoStarted', () => {
  audioTrack.play()
})
