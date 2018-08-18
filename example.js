const Apa102spi = require('apa102-spi')

var n = 0

led = new Apa102spi(24*8+2, 16)

setter()

function setter() {
  
  led.setLedColor(n, 30, 0, 0, 255)
  if(n === 0) {
    led.setLedColor((24*8)-1, 0, 0, 0, 0)
  } else {
    led.setLedColor(n - 1, 0, 0, 0, 0)
  }
  var bn = 24*8*4+8
  console.log(n, led.writeBuffer[bn], led.writeBuffer[bn+1], led.writeBuffer[bn+2], led.writeBuffer[bn+3])
  n++
  if(n >= (24*8)) {
    n = 0
  }
  led.sendLeds()
  setTimeout(() => {setter()}, 20)
}