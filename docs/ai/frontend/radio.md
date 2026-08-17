# Terminal Radio Streamer

## What
Integrated audio streaming module connecting to the Radio Browser API, rendering live audio oscilloscopes, and providing raw stream URLs and curl snippets.

## Where
- Radio view layout: `public/index.html` — `#tab-radio`
- Dedicated radio standalone page: `public/radio.html`
- Radio logic & visualizer: `public/js/app.js` — `fetchRadioStations`, `selectRadioStation`, `toggleRadioPlay`, `setupAudioVisualizer`
- Radio API endpoint: `https://de1.api.radio-browser.info/json/stations/search`
