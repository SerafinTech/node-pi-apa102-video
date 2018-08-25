# High performance pi-apa102-video for node.js and Raspberry Pi

This library will play video files directly to a video screen apa102 (or compatible) LED video screen along with the soundtrack. In order to use this library, make sure you have [ffmpeg](http://www.ffmpeg.org) installed on your system (including all necessary encoding/decoding libraries like libmp3lame and libx264).

## Installation

Via npm:

```sh
$ npm install pi-apa102-video --save
```

FFmpeg installation:

A handy utility that will also install ffmpeg and all the codecs you need is youtube-dl.  You can also use this utility to download YouTube videos to play back on your video screen.

```sh
$ sudo apt-get install youtube-dl
```

...or download and compile from (http://www.ffmpeg.org)

## Usage

### Wiring

Look up online on how to wire APA102 (Dotstar) LEDs to the Raspberry Pi.  I suggest using a breadboard and a level shifter to translate the 3.3v of the Pi to 5v of the LED strip/matrix. I have used the 74AHCT125 successfully.

### Programming
`sudo` must be used to acces the SPI pins on the Raspberry Pi

This is a `Promise` based library.

A 2-dimensional array is passed to the constructor to setup the layout of the LEDs. The numbers are the order the LEDs are wired starting with zero. If you have some open spots with no LEDs in the layout, insert a (-1) in the array.

For example:

```javascript
const apa102video = require('./apa102video')

const layoutMatrix = [
  [0, 1, 2],
  [5, 4, 3],
  [6, 7, -1]
]

// This is for a 3x3 LED screen where the LED layout weaves back and forth. 
// This screen only has 8 LEDs, so we insert a (-1) where the missing LED is.

const videoScreen = new apa102video(layoutMatrix)
```

See the `play.js` file for an example of how to play a video from the command line.