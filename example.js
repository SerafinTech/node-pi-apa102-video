const Apa102spi = require('apa102-spi')

var n = 0

led = new Apa102spi(24*8, 100)

setter()

function setter() {
  console.log(n)
  led.setLedColor(n, 30, 0, 0, 255)
  if(n === 0) {
    led.setLedColor((24*8)-1, 30, 0, 0, 0)
  } else {
    led.setLedColor(n - 1, 0, 0, 0, 0)
  }

  n++
  if(n >= (24*8)) {
    n = 0
  }
  led.sendLeds()
  setTimeout(() => {setter()}, 125)
}