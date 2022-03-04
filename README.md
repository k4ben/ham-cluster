# HamCluster
An event-based TypeScript module for accessing ham radio spot clusters.
## Installation 
```sh
npm install ham-cluster --save
```
## Usage
```javascript
const HamCluster = require('ham-cluster');

const rbnCluster = new HamCluster(callsign, {
  hostname: "telnet.reversebeacon.net",
  port: 7000,
  type: "rbn"
});

// const plainCluster = new HamCluster(callsign, {
//   hostname: "w3lpl.net",
//   port: 7373
// });

rbnCluster.on('connected', ()=> {
  console.log("Connected!");
});
rbnCluster.on('spot', spot => {
  console.log(spot);
});
rbnCluster.on('error', error => {
  console.error(error);
});
```

# TODO
* Add automatic detection for comment fields from RBN, FT8, N1MM, etc.
* Use inheritance for easy implementation ([RBNSpot, FT8Spot, N1MMSpot] extends Spot).
* Improve edge cases and error handling.