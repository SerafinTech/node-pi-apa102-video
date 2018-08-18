const Apa102spi = require('apa102-spi')

var n = 0

led = new Apa102spi(24*8, 100)

led.setLedColor(100, 30, 255, 0, 0)

led.sendLeds()

