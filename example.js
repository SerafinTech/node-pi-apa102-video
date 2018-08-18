const Apa102spi = require('apa102-spi')

var n = 0

led = new Apa102spi(24*8, 256)

led.setLedColor(24*8+1, 30, 255, 0, 0)

led.sendLeds()

