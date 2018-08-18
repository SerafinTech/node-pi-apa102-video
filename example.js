const Apa102spi = require('apa102-spi')

var n = 0

led = new Apa102spi(24*8, 100)

setInterval(() => {
  led.setLedColor(n, 31, 0, 0, 255)
  if(n === 0) {
    led.setLedColor(24*8-1, 0, 0, 0, 0)
  } else {
    led.setLedColor(n-1, 0, 0, 0, 0)
  }

  n++
  if(n >== 24*8) {
    n = 0
  }

  led.sendLeds()
}, 250)