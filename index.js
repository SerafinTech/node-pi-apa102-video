const Apa102spi = require('apa102-spi')
const Jimp = require('jimp')
const ramdisk = require('node-ramdisk')
const fs = require('fs-extra')
const ffmpeg = require('fluent-ffmpeg')
const chokidar = require('chokidar')

class Apa102Video {
  constructor(matrix, freqDiv, brightness) {
    this.matrix = matrix
    this.brightness = brightness
    this.disk = ramdisk('temp_img')
    this.diskmnt = null
    this.ledLength = 0

    this.matrix.forEach((y,yi) => {
      y.forEach((x, xi) => {
        if(matrix[yi,xi] !== -1) {
          this.ledLength++
        }
      })
    })

    console.log('Led strip length:', this.ledLength)

    this.ledDriver = new Apa102spi(this.ledLength+2, freqDiv)
  }
  
  play(video) {
    this.disk.create(10, (err, mount) => {
      if(err) {
        console.log(err)
      }
      this.diskmnt = mount
      ffmpeg(video)
        .noAudio()
        .native()
        .size((this.matrix[0].length).toString() + 'x' + (this.matrix.length).toString())
        .on('end', () => {
          this.disk.delete(this.diskmnt)
          setTimeout(() => {this.blank()}, 250)
          console.log('Video Ended')
        })
        .save(this.diskmnt+'/'+'image_%0d.bmp')
      const watcher = chokidar.watch(this.diskmnt, {
        ignored: /(^|[\/\\])\../,
        persistent: true
      })

      watcher.on('add', (imagePath) => { 
        var img = new Jimp(imagePath, (err, image) => {
          if (err) {
            console.log(err)
          } else {
            this.showFrame(image, imagePath)

          }
        })
      })

    })
  }

  showFrame(cFrame, imagePath) {
    try {   
      cFrame.scan(0, 0, cFrame.bitmap.width, cFrame.bitmap.height, (x, y, idx) => {
        if (x < this.matrix[0].length && y < this.matrix.length) {
          if (this.matrix[y][x] !== -1) {
            this.ledDriver.setLedColor(this.matrix[y][x], this.brightness, gammaCorrection(cFrame.bitmap.data[idx]), gammaCorrection(cFrame.bitmap.data[idx+1]), gammaCorrection(cFrame.bitmap.data[idx+2]))
          }
        }
        if (x == cFrame.bitmap.width - 1 && y == cFrame.bitmap.height - 1) {
          process.nextTick(() => {fs.remove(imagePath)})
          this.ledDriver.sendLeds()
        }
      })      
    }
    catch(err) {
      //console.log('invalid BMP')
    }
  }

  blank() {
    for (var n = 0; n < this.ledLength; n++) {
      this.ledDriver.setLedColor(n, 31, 0, 0, 0)
    }
    this.ledDriver.sendLeds()
  }

}

function gammaCorrection (n) {
  var correctionArray =
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2,
      2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5,
      5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10,
      10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16,
      17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24, 24, 25,
      25, 26, 27, 27, 28, 29, 29, 30, 31, 32, 32, 33, 34, 35, 35, 36,
      37, 38, 39, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 50,
      51, 52, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68,
      69, 70, 72, 73, 74, 75, 77, 78, 79, 81, 82, 83, 85, 86, 87, 89,
      90, 92, 93, 95, 96, 98, 99, 101, 102, 104, 105, 107, 109, 110, 112, 114,
      115, 117, 119, 120, 122, 124, 126, 127, 129, 131, 133, 135, 137, 138, 140, 142,
      144, 146, 148, 150, 152, 154, 156, 158, 160, 162, 164, 167, 169, 171, 173, 175,
      177, 180, 182, 184, 186, 189, 191, 193, 196, 198, 200, 203, 205, 208, 210, 213,
      215, 218, 220, 223, 225, 228, 231, 233, 236, 239, 241, 244, 247, 249, 252, 255 ]
  return correctionArray[n]
}

module.exports = Apa102Video