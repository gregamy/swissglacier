/*
  JavaScript for the “Sound of Melting Glaciers” site.

  This script drives three main pieces of functionality:
  1. A set of counters that estimate the current melt volume since the start of the
     year, remaining glacier volume and an intuitive translation into the number
     of water‑truck loads. The estimates are based on publicly reported data from
     the Swiss glacier monitoring network (GLAMOS) via news reports. In 2024 the
     glaciers lost roughly 2.5% of their volume, equivalent to about 1.2 cubic
     kilometres of ice【628112555071447†L159-L165】. At the start of the
     millennium the glaciers contained roughly 74.9 km³ of ice; by 2024 this had
     shrunk to 46.4 km³【628112555071447†L200-L205】. The code below assumes a
     constant melt rate throughout the year to derive a per‑second melt rate and
     uses it to compute the quantities displayed.
  2. A simple Google Maps integration that focuses on the Matterhorn region. The
     map is styled to match the dark aesthetic of the site. Replace
     `YOUR_API_KEY` in index.html with a valid Maps JavaScript API key for the
     map to render correctly.
  3. An audio toggle that allows visitors to unmute the background video and hear
     the sound of melting water. Autoplaying audio is muted by default due to
     browser restrictions.
*/

(() => {
  // Data constants
  const START_VOLUME_KM3 = 46.4; // total glacier volume at the start of 2024 (km³)
  const YEARLY_MELT_KM3 = 1.2;   // estimated ice loss in 2024 (km³)
  const TRUCK_CAPACITY_L = 10000; // litres per water truck (approximate)

  // Derived constants
  const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
  const MELT_RATE_M3_PER_SEC = (YEARLY_MELT_KM3 * 1e9) / SECONDS_PER_YEAR;
  const MELT_RATE_L_PER_SEC = MELT_RATE_M3_PER_SEC * 1000;
  const TRUCK_RATE_PER_SEC = MELT_RATE_L_PER_SEC / TRUCK_CAPACITY_L;

  // Cache DOM elements
  const volumeEl = document.getElementById('volume-remaining');
  const meltedEl = document.getElementById('melted-since');
  const trucksEl = document.getElementById('truck-count');
  const audioToggleBtn = document.getElementById('audio-toggle');
  const videoEl = document.getElementById('background-video');

  // The start of the observation year – 1 Jan 2024 UTC. This date is used to
  // compute how much of the year has elapsed and thus how much ice has melted.
  const startOfYear = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));

  // Format large numbers with thousands separators
  function formatNumber(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Update counters periodically
  function updateCounters() {
    const now = new Date();
    const secondsSinceStart = (now.getTime() - startOfYear.getTime()) / 1000;
    // Melted volume in cubic metres and litres
    const meltedM3 = secondsSinceStart * MELT_RATE_M3_PER_SEC;
    const meltedL = meltedM3 * 1000;
    const trucks = secondsSinceStart * TRUCK_RATE_PER_SEC;
    // Remaining volume in km³
    let remainingKm3 = START_VOLUME_KM3 - (YEARLY_MELT_KM3 * (secondsSinceStart / SECONDS_PER_YEAR));
    if (remainingKm3 < 0) remainingKm3 = 0;

    // Update the DOM
    volumeEl.textContent = remainingKm3.toFixed(2);
    meltedEl.textContent = formatNumber(meltedM3.toFixed(0));
    trucksEl.textContent = formatNumber(trucks.toFixed(0));
  }

  // Kick off the counter updates
  updateCounters();
  setInterval(updateCounters, 1000);

  // Audio toggle: allow visitors to enable or disable the video’s audio track.
  audioToggleBtn.addEventListener('click', () => {
    if (videoEl.muted) {
      videoEl.muted = false;
      audioToggleBtn.textContent = 'Ton ausschalten';
      audioToggleBtn.classList.add('active');
    } else {
      videoEl.muted = true;
      audioToggleBtn.textContent = 'Ton abspielen';
      audioToggleBtn.classList.remove('active');
    }
  });

  // Expose the initMap function globally for the Google Maps callback. The map
  // initialises with a dark theme and a 3D tilt over the Matterhorn region.
  window.initMap = () => {
    const matterhorn = { lat: 45.97631, lng: 7.65827 };
    const map = new google.maps.Map(document.getElementById('map'), {
      center: matterhorn,
      zoom: 13,
      mapTypeId: 'hybrid',
      tilt: 45,
      heading: 0,
      disableDefaultUI: true,
    });
    // Dark theme styling to match the site’s aesthetic
    const darkStyle = [
      { elementType: 'geometry', stylers: [{ color: '#1e1e1e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1e1e1e' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d6d6d6' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#383838' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1e1e1e' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#0a3148' }],
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#0c3b47' }],
      },
    ];
    map.setOptions({ styles: darkStyle });
    // Add a marker on the Matterhorn
    new google.maps.Marker({
      position: matterhorn,
      map: map,
      title: 'Matterhorn',
    });
  };
})();