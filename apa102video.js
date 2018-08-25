const apa102spi = require('apa102-spi')
const jimp = require('serafintech-jimp')
const ramdisk = require('node-ramdisk')
const fs = require('fs-extra')
const ffmpeg = require('fluent-ffmpeg')
const chokidar = require('chokidar')
const EventEmitter = require('events').EventEmitter
const lame = require('lame')
const speaker = require('speaker')

const defaultOptions = {
  freqDivider: 100,
  brightness: 8,
  gamma: 2.6,
  ramdiskSize: 10
}

const defaultVideoOptions = {
  sound: false,
  rawSound: false,
  keepAspect : false
}

class Apa102video extends EventEmitter {
  constructor(matrix, options = {}) {
    super()
    Object.assign(this, defaultOptions, options)
    this.ledLength = Math.max(...matrix.join().split(',')) + 1
    this.matrix = matrix
    this.disk = null
    this.gammaArray = createGammaArray(this.gamma)
    this.triggerSound = false
  }

  //Initiate ramdisk, ledDriver and audio
  init() {
    this.diskmnt = null
    this.ledDriver = new apa102spi(this.ledLength, this.freqDivider)
    this.disk = ramdisk('temp_image_storage')
    
    //Sound Setup
    this.lameStream = new lame.Decoder()
    this.lameStream.once('format', (lameFormat) => {
      this.speaker = new speaker(lameFormat)
      this.lameStream.pipe(this.speaker)
    })

    const startWatch = () => {
      this.watcher = chokidar.watch(this.diskmnt, {
        ignored: /(^|[\/\\])\../,
        persistent: true
      })
      
      this.watcher.on('add', (framePath) => {
        this.newFrame(framePath)
      })
    }

    return new Promise((resolve, reject) => {
      this.disk.create(this.ramdiskSize, (err, mount) => {
        if(err) {
          this.disk.delete(err.message.split('"')[1], (err) => {
            if (err) { 
              reject(err)
            } else {
              this.disk.create(this.ramdiskSize, (err, mount) => {
                if (err) {
                  reject(err)
                } else {
                  this.diskmnt = mount
                  startWatch()
                  resolve()
                }
              })
            }
          })
        } else {
          this.diskmnt = mount
          startWatch()
          resolve()
        }
      })
    })
  }

  // Play video
  playVideo(video, options = {}) {
    let videoOptions = {}
    Object.assign(videoOptions, defaultVideoOptions, options)

    let videoPlayer = ffmpeg(video)
    
    videoPlayer
      .native()
      .size(this.matrix[0].length.toString()+'x'+this.matrix.length.toString())
      .on('start', (commandLine) => {
        this.triggerSound = videoOptions.sound
      })
      .on('progress', (progress) => {
        this.progress = progress
      })
      .output(this.diskmnt+'/'+'image_%0d.bmp')

      if(videoOptions.keepAspect) {
        videoPlayer.autopad()
      }

      if(videoOptions.rawSound) {
        videoPlayer
          .output(new speaker())
          .format('s16le')
      }

      
      
    videoPlayer.run()

    return videoPlayer
  }

  //New frame handling
  newFrame(framePath) {
    if (this.triggerSound) {
      this.playMp3(this.triggerSound)
      this.triggerSound = false
    }
    jimp.read(framePath)
      .then(image => this.showFrame(image))
      .then(() => fs.remove(framePath))
      .catch(err => {
        console.error(err);
      })
  }

  //scan frame and push to leds
  showFrame(frame) {
    return new Promise((resolve, reject) => {
      try {   
        frame.scan(0, 0, frame.bitmap.width, frame.bitmap.height, (x, y, idx) => {
          if (x < this.matrix[0].length && y < this.matrix.length) {
            if (this.matrix[y][x] !== -1) {
              this.ledDriver.setLedColor(this.matrix[y][x], this.brightness, gammaCorrection(frame.bitmap.data[idx], this.gammaArray), gammaCorrection(frame.bitmap.data[idx+1], this.gammaArray), gammaCorrection(frame.bitmap.data[idx+2], this.gammaArray))
            }
          }
          if (x == frame.bitmap.width - 1 && y == frame.bitmap.height - 1) {       
            this.ledDriver.sendLeds()
            resolve()
          }
        })     
      }
      catch(err) {
        //ignore this error
        //reject(err)
      }
    })
  }

  //Start Mp3 Audio
  playMp3(fileLocation) {
    return fs.createReadStream(fileLocation).pipe(this.lameStream)
  }

  //Create Mp3 Audio from video file
  createMp3(fileLocation) {
    console.log('Creating Audio File...')
    const mp3FileName = fileLocation.substring(0, fileLocation.lastIndexOf('.')) + '.mp3'
    return new Promise((resolve, reject) => {
      fs.pathExists(mp3FileName)
        .then(exist => {
          if(exist) {
            console.log('Not creating file: Using existing.')
            resolve(mp3FileName)
          } else {
            ffmpeg(fileLocation)
              .on('end', () => {
                resolve(mp3FileName)
              })
              .save(mp3FileName)
          }
        })
        .catch(e => {
          reject(e)
        })      
    })
  }

  clearScreen() {
    for (var n = 0; n < this.ledLength; n++) {
      this.ledDriver.setLedColor(n, 31, 0, 0, 0)
    }
    this.ledDriver.sendLeds()
    this.ledDriver.sendLeds()
  }
      
}

function gammaCorrection (n, gammaArray) {
  return gammaArray[n]
}

function createGammaArray(gamma) {
  var gammaArray = []
  for (var i = 0; i < 256; i++) {
    gammaArray.push(Math.floor(Math.pow(i/255, gamma) * 255 + 0.5))
  }
  
  return gammaArray
}


module.exports = Apa102video