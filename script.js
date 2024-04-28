mapboxgl.accessToken = 'pk.eyJ1IjoiaWFyYWtpc3RhaW4iLCJhIjoiY2podnY0cWs5MTAyaTNrbnY3MnR5OHJ0bSJ9.aOqeUPZkBISqt1UKpmmX7g';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/iarakistain/clj8euaod003n01o0di9960rp',
        projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
        zoom: 1.9,
        center: [-90, 40]
    });

   map.on('style.load', () => {
        // Custom atmosphere styling
     map.setFog({
            'color': 'rgb(237, 234, 222)',
         // Pink fog / lower atmosphere
            'high-color': 'rgb(35, 92, 223)', // Blue sky / upper atmosphere
            'horizon-blend': 1, // Exaggerate atmosphere (default is .1)
          
          'space-color': 'rgb(220, 159, 159)', // Background color
          'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
        });

        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.terrain-rgb'
        });

        map.setTerrain({
            'source': 'mapbox-dem',
            'exaggeration': 1.5
        });
    });
    // The following values can be changed to control rotation speed:

    // At low zooms, complete a revolution every two minutes.
    const secondsPerRevolution = 120;
    // Above zoom level 5, do not rotate.
    const maxSpinZoom = 5;
    // Rotate at intermediate speeds between zoom levels 3 and 5.
    const slowSpinZoom = 3;

    let userInteracting = false;
    let spinEnabled = true;

    function spinGlobe() {
        const zoom = map.getZoom();
        if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
            let distancePerSecond = 360 / secondsPerRevolution;
            if (zoom > slowSpinZoom) {
                // Slow spinning at higher zooms
                const zoomDif =
                    (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
                distancePerSecond *= zoomDif;
            }
            const center = map.getCenter();
            center.lng -= distancePerSecond;
            // Smoothly animate the map over one second.
            // When this animation is complete, it calls a 'moveend' event.
            map.easeTo({ center, duration: 1000, easing: (n) => n });
        }
    }

    // Pause spinning on interaction
    map.on('mousedown', () => {
        userInteracting = true;
    });

    // Restart spinning the globe when interaction is complete
    map.on('mouseup', () => {
        userInteracting = false;
        spinGlobe();
    });

    // These events account for cases where the mouse has moved
    // off the map, so 'mouseup' will not be fired.
    map.on('dragend', () => {
        userInteracting = false;
        spinGlobe();
    });
    map.on('pitchend', () => {
        userInteracting = false;
        spinGlobe();
    });
    map.on('rotateend', () => {
        userInteracting = false;
        spinGlobe();
    });

    // When animation is complete, start spinning if there is no ongoing interaction
    map.on('moveend', () => {
        spinGlobe();
    });

    document.getElementById('btn-spin').addEventListener('click', (e) => {
        spinEnabled = !spinEnabled;
        if (spinEnabled) {
            spinGlobe();
            e.target.innerHTML = 'Pause rotation';
        } else {
            map.stop(); // Immediately end ongoing animation
            e.target.innerHTML = 'Start rotation';
        }
    });
map.addControl(new mapboxgl.NavigationControl());

const directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: 'metric',
  profile: 'mapbox/driving',
  alternatives: false,
  geometries: 'geojson',
  controls: { instructions: false },
  flyTo: false
});

map.addControl(directions, 'top-left');
spinGlobe();