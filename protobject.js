import "https://cdn.plot.ly/plotly-2.34.0.min.js";
import Protobject from './js/protobject.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

document.body.insertAdjacentHTML('beforeend', `
<!DOCTYPE html>

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="mystyle.css">
    <title>Entrega-2-Grupo-3</title>
    <link rel="icon" href="https://cdn-icons-png.flaticon.com/512/17197/17197790.png" type="image/png">
    <script src="https://cdn.plot.ly/plotly-2.35.2.min.js" charset="utf-8"></script>
    <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
</head>

<body>
    <main class="content-wrap">

        <div id="vis"></div>
        <div id="top-countries"
            style="position: absolute; top: 20px; left: 2%; font-size: 15px; font-weight: bold; text-align: center;">
            Paises con la mayor prevalencia
        </div>
        <div class="slider-container">
            <label for="yearSlider">Selecciona un año:</label>
            <input type="range" id="yearSlider" min="1980" max="2012" value="1997" step="1">
            <button id="playPauseButton">▶️ Animación por los años ▶️</button>
        </div>

        <div id="additional-info">
            <div class="table"></div>
            <div style="top: 150px; left: 10px;"></div>
        </div>


        <div id="vis2"></div>
        <footer class="site-footer">
            <p>La información fue retirada de: <a href="https://ourworldindata.org/smoking" target="_blank"
                    rel="noopener noreferrer">Our World in Data</a>&nbsp;(Smoking)</p>
        </footer>
    </main>

    <script src="script.js"></script>
</body>

</html>	<style>
	body {
  margin: 0 auto;
  /* Puedes cambiar el color de fondo (background-color) si lo deseas */
  background-color: #ffff;
  max-width: 1200px;
  min-width: 500px;
  display: flex;
  justify-content: center;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
    'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
}

.js-plotly-plot .plotly .main-svg {
  border: 0px;
}

svg {
  border: solid 1px rgb(0, 0, 0);
}

/* Footer always stays at the bottom */
.site-footer {
  background-color: white;
  text-align: center;
  padding: 10px;
  width: 100%;
  margin-top: auto; /* Pushes the footer to the bottom */
}

.textStart {
  flex: 1; /* Allow the textStart to take up available space */
}

.textStart li {
  padding-top: 8px;
}

.textStart.legend span {
  width: 15px;
  height: 15px;
  background-color: rgb(0, 0, 0);
  display: inline-block;
}

#additional-info {
  display: flex; /* Use flexbox for layout */
  justify-content: space-between; /* Spread the items apart */
  align-items: flex-start; /* Align them at the top (same height) */
  font-size: 14px;
}

#country-selector {
  margin-top: 10px;
  margin-bottom: 5px;
}

#countrySelect {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

#vis {
  width: 200%; /* Set the width to 100% of its parent */
  margin: 0 auto; /* Center horizontally */
  display: flex; /* Use flexbox for centering */
  align-items: center; /* Center content vertically, if needed */
}

#playPauseButton {
  margin: 40px; /* Add some space around the button */
  padding: 5px 10px; /* Add padding inside the button */
  font-size: 16px; /* Set the font size */
  background-color: #ccdceb; /* Remove quotes */
  border: 0.25px solid #9aabbc; /* Remove quotes */
}

.table {
  display: table;
  border-collapse: separate;
  box-sizing: border-box;
  text-indent: initial;
  unicode-bidi: isolate;
  border-spacing: 2px;
  border-color: gray;
}

#additional-info {
  top: 100px; /* adjust as needed */
  left: 100px; /* adjust as needed */
}

.slider-container {
  display: flex;
  flex-direction: column; /* Stack label and slider vertically */
  align-items: center; /* Center items horizontally */
}

/* Style the slider itself */
input[type='range'] {
  -webkit-appearance: none; /* Remove default styling in WebKit browsers */
  width: 50%; /* Full width of the container */
  height: 8px; /* Height of the slider track */
  background: #ddd; /* Background color of the slider track */
  border-radius: 5px; /* Rounded corners for the track */
  outline: none; /* Remove outline */
}

/* Style the slider thumb */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none; /* Remove default styling in WebKit browsers */
  appearance: none; /* Remove default styling */
  width: 20px; /* Width of the thumb */
  height: 20px; /* Height of the thumb */
  background: #36c2ce; /* Color of the thumb */
  border-radius: 50%; /* Make the thumb circular */
  cursor: pointer; /* Pointer cursor on hover */
}

/* Style the slider thumb for Firefox */
input[type='range']::-moz-range-thumb {
  width: 20px; /* Width of the thumb */
  height: 20px; /* Height of the thumb */
  background: blue; /* Color of the thumb */
  border-radius: 50%; /* Make the thumb circular */
  cursor: pointer; /* Pointer cursor on hover */
}

/* Style the slider thumb for Internet Explorer */
input[type='range']::-ms-thumb {
  width: 20px; /* Width of the thumb */
  height: 20px; /* Height of the thumb */
  background: blue; /* Color of the thumb */
  border-radius: 50%; /* Make the thumb circular */
  cursor: pointer; /* Pointer cursor on hover */
}

/* Optional: Change the color of the track when the slider is active */
input[type='range']:active {
  background: #ccc; /* Change the background when active */
}

#top3-table {
  position: absolute; /* Use absolute positioning */
  top: 50px; /* Distance from the top of the page */
  left: 15%; /* Center horizontally */
  transform: translateX(-50%); /* Adjust to center it */}
 </style>
`);

const SVG = d3.select('#vis').append('SVG');

// Editar tamaños como estime conveniente
const WIDTH_VIS = 1200;
const HEIGHT_VIS = 250;
var actual_year = 1997;

let currentCenter = null;
let currentScale = null;

const MARGIN = {
  top: 10,
  bottom: 10,
  right: 10,
  left: 10,
};
const HEIGHTVISINSIDE = HEIGHT_VIS - MARGIN.top - MARGIN.bottom;
const WIDTHVISINSIDE = WIDTH_VIS - MARGIN.right - MARGIN.left;

SVG.attr('width', WIDTH_VIS).attr('height', HEIGHT_VIS);

// Global variables to hold data
let smokerData = [];
let countryData = [];

// Variables for animation control
let isPlaying = false;
let intervalId = null;
const startYear = 1980;
const endYear = 2012;
let currentYear = actual_year; // Start with the actual_year

// Main function to initiate the entire process
function main() {
  // Load country coordinates first
  loadCountryCoordinates().then(() => {
    // Once coordinates are loaded, load smoker data and render the map
    loadCSVData('data/Daily-Smokers.csv')
      .then((csvData) => {
        smokerData = csvData; // Store the data globally
        updateVisualization(actual_year);
        addMapEventListeners();
      })
      .catch((error) => {
        console.error('Error loading CSV:', error);
      });
  });

  // Slider event to change the year
  d3.select('#yearSlider').on('input', function () {
    actual_year = +this.value; // Update the actual_year variable
    currentYear = actual_year; // Update currentYear used in animation
    console.log('Selected Year:', actual_year);

    // Update the visualization for the new year
    updateVisualization(actual_year);

    // If animation is playing, reset it
    if (isPlaying) {
      stopAnimation();
      d3.select('#playPauseButton').text('▶️ Animación por los años ▶️');
      isPlaying = false;
    }
  });

  // Handle the play/pause button
  const playPauseButton = d3.select('#playPauseButton');
  playPauseButton.on('click', function () {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playPauseButton.text('⏸️ Parar animación ⏸️');
      playPauseButton.style('background-color', '#36C2CE');
      startAnimation();
    } else {
      playPauseButton.text('▶️ Animación por los años ▶️');
      playPauseButton.style('background-color', '#CBDCEB');
      stopAnimation();
    }
  });
}

// Function to update the visualization for a given year
function updateVisualization(year) {
  processData(smokerData, year);
  const plotData = preparePlotData();
  const mapLayout = prepareMapLayout(year);
  renderMap(plotData, mapLayout);
}

// Helper function to extract a specific key's value from the dataset
function extractData(dataArray, key) {
  return dataArray.map((dataItem) => dataItem[key]);
}

// Load the CSV file using d3
function loadCSVData(csvFilePath) {
  return d3.csv(csvFilePath, d3.autoType);
}

// Function to process the data and prepare it for plotting
function processData(smokerData, year) {
  countryData = []; // Reset countryData for each year
  smokerData.forEach((row) => {
    // Check if the year is the selected year
    if (row['Year'] === year) {
      countryData.push({
        prevalence: row['Daily smoking prevalence - both (IHME, GHDx (2012))'],
        country: row['Entity'],
        population: row['Population'],
        code: row['Code'],
        year: row['Year'],
      });
    }
  });
}

// Function to find the top 3 countries with the highest smoking prevalence
function findTop3CountriesPrevalence() {
  const top3 = countryData
    .sort((a, b) => b.prevalence - a.prevalence)
    .slice(0, 3);
  console.log(top3);
  return top3;
}

// Function to prepare plot data for Plotly
function preparePlotData() {
  return [
    {
      type: 'choropleth',
      locationmode: 'country names',
      locations: extractData(countryData, 'country'),
      z: extractData(countryData, 'prevalence'),
      text: extractData(countryData, 'country'),
      hoverinfo: 'location+z', // Show country and prevalence on hover
      colorscale: [
        [0, '#CBDCEB'],
        [0.25, '#36C2CE'],
        [0.5, '#3A6D8C'],
        [0.75, '#003161'],
        [1, '#0002A1'],
      ],
      zmin: 3.2,
      zmax: 50.0,
      colorbar: { title: { text: 'Fumadores' } },
      autocolorscale: false,
    },
  ];
}

// Function to prepare the layout for the map
function prepareMapLayout(year) {
  return {
    title: {
      text: `Porcentaje de fumadores diarios en ${year}`,
      x: 0.49,
      xanchor: 'center',
      y: 0.95,
      font: { size: 19, family: 'Arial, sans-serif', color: 'black' },
    },
    geo: {
      projection: { type: 'robinson' },
      showframe: false, // Hide the frame
      showcoastlines: true, // Optional: Show coastlines if desired
      coastlinecolor: 'black', // Optional: Set coastline color
      bgcolor: 'rgba(0,0,0,0)', // Optional: Set background color to transparent
      landcolor: 'lightgray', // Optional: Set land color
      subunitcolor: 'white', // Optional: Set subunit color
      framecolor: 'white',
    },
    showframe: false,
    width: 900,
    height: 400,
    margin: { l: 50, r: 50, t: 50, b: 50 },
  };
}

// Modified renderMap function to clear hover labels during updates
function renderMap(plotData, layout) {
  const visDiv = document.getElementById('vis');

  // Check if the plot already exists
  if (visDiv.data) {
    // Get current center and scale
    const currentLayout = visDiv.layout;
    if (currentLayout && currentLayout.geo) {
      if (!layout.geo) layout.geo = {};
      if (!layout.geo.center) layout.geo.center = {};
      if (!layout.geo.projection) layout.geo.projection = {};
      layout.geo.center = currentCenter || layout.geo.center;
      layout.geo.projection.scale = currentScale || layout.geo.projection.scale;
    }

    // Update the plot using Plotly.react
    Plotly.react('vis', plotData, layout, { showLink: false });

    // **Clear any existing hover labels**
    Plotly.Fx.unhover('vis');
  } else {
    // First time, create the plot
    Plotly.newPlot('vis', plotData, layout, { showLink: false });
  }

  // After clearing hover labels
  Plotly.Fx.unhover('vis');

  // Get the current mouse position relative to the plot
  const mouseX = visDiv._fullLayout._lastInputTime
    ? visDiv._fullLayout._lastHoverX
    : null;
  const mouseY = visDiv._fullLayout._lastInputTime
    ? visDiv._fullLayout._lastHoverY
    : null;

  // If mouse position is available, trigger a hover event
  if (mouseX !== null && mouseY !== null) {
    Plotly.Fx.hover('vis', { xval: mouseX, yval: mouseY });
  }

  // Add event listener to update currentCenter and currentScale during drag
  visDiv.on('plotly_relayouting', function (eventData) {
    if (
      eventData['geo.center.lon'] !== undefined &&
      eventData['geo.center.lat'] !== undefined
    ) {
      currentCenter = {
        lon: eventData['geo.center.lon'],
        lat: eventData['geo.center.lat'],
      };
    }
    if (eventData['geo.projection.scale'] !== undefined) {
      currentScale = eventData['geo.projection.scale'];
    }
  });

  // Get the top 3 countries with the highest smoking prevalence
  const top3Countries = findTop3CountriesPrevalence();

  // Add a table to display the top 3 countries
  addTop3Table(top3Countries);

  // Add hover interaction
  addHoverInteraction();

  // Add button event handlers (if applicable)
  // addButtonEventHandlers();
}

function addHoverInteraction() {
  const vis = document.getElementById('vis');

  // Handle hover events to display details in the designated area
  vis.on(
    'plotly_hover',
    (data) => {
      const infotext = data.points.map(
        (d) => `${d.location}: ${d.z}% prevalence`
      );

      // Display this information in the console or create a display area in your HTML
      console.log(infotext);
    },
    { passive: true }
  ); // Mark as passive

  // Handle unhover events
  vis.on(
    'plotly_unhover',
    () => {
      // Clear the info when the mouse is not hovering over the map
    },
    { passive: true }
  ); // Mark as passive
}

function addMapEventListeners() {
  const visDiv = document.getElementById('vis');

  visDiv.on('plotly_click', function (data) {
    console.log('Country clicked:', data);
    var prevalence = data.points[0].z;
    console.log('Prevalence:', prevalence);

    var audioSrc = '';
    if (prevalence >= 0 && prevalence < 18) {
      audioSrc = 'audio-tos/tiny-cough.wav';
    } else if (prevalence >= 18 && prevalence < 35) {
      audioSrc = 'audio-tos/medium-cough.mp3';
    } else if (prevalence >= 35 && prevalence <= 50) {
      audioSrc = 'audio-tos/big-cough.mp3';
    }

    if (audioSrc) {
      var audio = new Audio(audioSrc);
      audio.volume = 1.0;
      audio
        .play()
        .then(function () {
          console.log('Audio playback started');
        })
        .catch(function (error) {
          console.error('Audio playback failed:', error);
        });
    } else {
      console.warn('No audio source selected');
    }
  });

  // Move other event listeners here if needed
}

function addTop3Table(top3Countries) {
  // Clear the table container before adding new data
  d3.select('.table').selectAll('*').remove();

  const newTableContainer = d3
    .select('.table')
    .append('div')
    .attr('id', 'top3-table');

  const table = newTableContainer
    .append('table')
    .style('border-collapse', 'collapse')
    .style('width', '300px')
    .style('table-layout', 'fixed');

  // Add table headers
  const header = table.append('thead').append('tr');
  header
    .append('th')
    .text(' ')
    .style('border', '0px solid black')
    .style('padding', '10px')
    .style('width', '100px'); // Fixed width for country cell
  header
    .append('th')
    .text('Prevalencia')
    .style('border', '0px solid black')
    .style('padding', '10px')
    .style('text-align', 'left')
    .style('width', '200px'); // Fixed width for prevalence cell

  // Table body
  const tbody = table.append('tbody');
  top3Countries.forEach((country) => {
    const row = tbody.append('tr');
    row
      .append('td')
      .text(country.country)
      .style('border', '0px solid black')
      .style('padding', '10px')
      .style('font-size', '14px')
      .style('height', '40px')
      .style('width', '100px')
      .style('overflow', 'hidden')
      .style('text-align', 'center');

    // Prevalence cell containing the SVG
    const prevalenceCell = row
      .append('td')
      .style('border', '0px solid black')
      .style('padding', '10px')
      .style('height', '40px')
      .style('width', '200px')
      .style('overflow', 'hidden');

    // SVG for the prevalence bar
    const svg = prevalenceCell
      .append('svg')
      .style('border', '0px solid black')
      .attr('width', '100%')
      .attr('height', '100%');

    const prevalenceWidth = (country.prevalence / 100) * 200;

    // Add the rectangle representing prevalence
    svg
      .append('rect')
      .attr('width', prevalenceWidth)
      .attr('height', '100%')
      .attr('fill', '#36C2CE')
      .attr('y', 0);

    // Add the text showing the prevalence percentage with 1 decimal inside the SVG
    svg
      .append('text')
      .attr('x', prevalenceWidth - 10) // Adjusted position near the end of the rectangle
      .attr('y', '50%') // Vertically centered
      .attr('dy', '0.35em') // Vertical alignment adjustment
      .attr('text-anchor', 'end') // Text alignment at the end of the rectangle
      .style('fill', 'white')
      .style('font-size', '12px')
      .text(`${country.prevalence.toFixed(1)}%`);
  });
}

// Global object to store country coordinates
let countryCoordinates = {};

// Load the CSV file with country codes and coordinates
function loadCountryCoordinates() {
  return d3.csv('./data/countries_codes_and_coordinates.csv').then((data) => {
    // Parse the data to extract ISO-3 codes, latitudes, and longitudes
    data.forEach((row) => {
      // Clean up any possible quotes and convert lat/lon to numbers
      const countryCode = row['Alpha-3 code'].replace(/"/g, '').trim(); // Remove quotes from ISO-3 code

      const latitude = parseFloat(row['Latitude (average)'].replace(/"/g, '')); // Convert lat to number
      const longitude = parseFloat(
        row['Longitude (average)'].replace(/"/g, '')
      ); // Convert lon to number

      // Store in the countryCoordinates object
      countryCoordinates[countryCode] = {
        lat: latitude,
        lon: longitude,
      };
    });

    console.log('Loaded country coordinates:', countryCoordinates); // Debug to ensure correct loading
  });
}

// Function to get lat/lon for a given ISO-3 country code
function getCountryCoordinates(countryCode) {
  return countryCoordinates[countryCode] || { lat: 0, lon: 0 }; // Return default or placeholder if not found
}

// Function to highlight and zoom to a specific country
function highlightCountry(country) {
  const coords = getCountryCoordinates(country.code); // Get the lat/lon for the selected country
  console.log('Highlighting:', country, coords);

  Plotly.relayout('vis', {
    'geo.center': {
      lat: coords.lat,
      lon: coords.lon,
    },
    'geo.projection.scale': 3, // Adjust scale as needed
  });
}

// Functions for animation control
function startAnimation() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (currentYear < endYear) {
      currentYear++;
    } else {
      currentYear = startYear;
    }
    actual_year = currentYear; // Sync actual_year with currentYear
    updateVisualization(currentYear);
    d3.select('#yearSlider').property('value', currentYear); // Update slider position
  }, 1000); // Interval of 1 second
}

function stopAnimation() {
  if (intervalId) clearInterval(intervalId);
}

// Call the main function to run the code
main();

console.log('Script loaded');

