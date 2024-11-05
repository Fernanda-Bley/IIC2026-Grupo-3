const SVG = d3.select('#vis').append('SVG');

// Editar tamaños como estime conveniente
const WIDTH_VIS = 1200;
const HEIGHT_VIS = 250;

const MARGIN = {
  top: 10,
  bottom: 10,
  right: 10,
  left: 10,
};
const HEIGHTVISINSIDE = HEIGHT_VIS - MARGIN.top - MARGIN.bottom;
const WIDTHVISINSIDE = WIDTH_VIS - MARGIN.right - MARGIN.left;

SVG.attr('width', WIDTH_VIS).attr('height', HEIGHT_VIS);

// Main function to initiate the entire process

function main() {
  // Load country coordinates first
  loadCountryCoordinates().then(() => {
    // Once coordinates are loaded, load smoker data and render the map
    loadCSVData('./InvestigacionMaximos/data/Population-Smokers-1997.csv')
      .then((csvData) => {
        processData(csvData);
        const plotData = preparePlotData();
        const mapLayout = prepareMapLayout();
        renderMap(plotData, mapLayout);
      })
      .catch((error) => {
        console.error('Error loading CSV:', error);
      });
  });
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
function processData(smokerData) {
  smokerData.forEach((row) => {
    countryData.push({
      prevalence: row['Daily smoking prevalence - both (IHME, GHDx (2012))'],
      country: row['Entity'],
      population: row['Population'],
      code: row['Code'],
      year: row['Year'],
    });
  });
}

function populateCountryDropdown() {
  const countrySelect = d3.select('#countrySelect');

  countryData.forEach((country) => {
    countrySelect
      .append('option')
      .attr('value', country.country)
      .text(country.country);
  });
}

function handleCountrySelection() {
  const countrySelect = d3.select('#countrySelect');

  countrySelect.on('change', function () {
    const selectedCountryName = this.value;

    // Find the selected country from the data
    const selectedCountry = countryData.find(
      (country) => country.country === selectedCountryName
    );

    console.log('SELECTED COUNTRY: ', selectedCountry);

    if (selectedCountry) {
      // Zoom into the selected country
      highlightCountry(selectedCountry);

      // Update the textStart div with the selected country's name and prevalence
      d3.select('#detailName').text(selectedCountry.country);
      d3.select('#detailPreval').text(`${selectedCountry.prevalence}%`);
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
        [0, '#72FFFF'],
        [0.5, '#0096FF'],
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
function prepareMapLayout() {
  return {
    title: {
      text: 'Fumadores diarios en 1997 (per capita)',
      x: 0.47,
      xanchor: 'center',
      y: 0.85,
      font: { size: 19, family: 'Arial, sans-serif', color: 'black' },
    },
    geo: { projection: { type: 'robinson' }, showframe: false },
    width: 800,
    height: 600,
    margin: { l: 50, r: 50, t: 50, b: 50 },
  };
}

function renderMap(plotData, layout) {
  Plotly.newPlot('vis', plotData, layout, { showLink: false });
  document.getElementById('vis').on('plotly_click', function(data) {
    // Get the prevalence value from the click event
    var prevalence = data.points[0].z; // Assuming 'z' contains the prevalence value

    // Check if the prevalence is between 0 and 15
    if (prevalence >= 0 && prevalence <= 17) {
      var audio = new Audio('audio-tos/tiny-cough.wav');
      audio.play();
    }
    else if (prevalence >= 18 && prevalence <= 34) {
      var audio = new Audio('audio-tos/medium-cough.mp3');
      audio.play();
    }
    else if (prevalence >= 35 && prevalence <= 50){
      var audio = new Audio('audio-tos/big-cough.mp3');
      audio.play();
    }
  });

  // Get the top 3 countries with the highest smoking prevalence
  const top3Countries = findTop3CountriesPrevalence();

  // Add a table to display the top 3 countries
  addTop3Table(top3Countries);

  // Add hover interaction
  addHoverInteraction();

  // Add button event handlers
  addButtonEventHandlers();

  // Populate the country dropdown and handle selection
  populateCountryDropdown();
  handleCountrySelection();

  // Render the bar plot for the top 5 countries by population
  
}

function addHoverInteraction() {
  const vis = document.getElementById('vis');

  // Handle hover events to display details in the designated area
  vis.on('plotly_hover', (data) => {
    const infotext = data.points.map(
      (d) => `${d.location}: ${d.z}% prevalence`
    );

    // Display this information in the custom area of your page
    d3.select('#detailName').text(data.points[0].location);
    d3.select('#detailPreval').text(`${data.points[0].z}%`);
  }, { passive: true }); // Mark as passive

  // Handle unhover events to clear the displayed details
  vis.on('plotly_unhover', () => {
    // Clear the info when the mouse is not hovering over the map
    d3.select('#detailName').text('');
    d3.select('#detailPreval').text('');
  }, { passive: true }); // Mark as passive
}

// Function to add a table to display the top 3 countries with the highest smoking prevalence
function addTop3Table(top3Countries) {
  const tableContainer = d3
    .select('.table')
    .append('div')
    .attr('id', 'top3-table')
    .style('top', '650px')
    .style('left', '50px');

  const table = tableContainer
    .append('table')
    .style('border-collapse', 'collapse')
    .style('width', '300px');

  // Add table headers
  const header = table.append('thead').append('tr');
  header
    .append('th')
    .text('Rank')
    .style('border', '1px solid black')
    .style('padding', '5px');
  header
    .append('th')
    .text('Country')
    .style('border', '1px solid black')
    .style('padding', '5px');
  header
    .append('th')
    .text('Prevalence')
    .style('border', '1px solid black')
    .style('padding', '5px');
  header
    .append('th')
    .text('Population')
    .style('border', '1px solid black')
    .style('padding', '5px');

  // Add table rows for the top 3 countries
  const tbody = table.append('tbody');
  top3Countries.forEach((country, index) => {
    const row = tbody.append('tr');
    row
      .append('td')
      .text(index + 1)
      .style('border', '1px solid black')
      .style('padding', '5px');
    row
      .append('td')
      .text(country.country)
      .style('border', '1px solid black')
      .style('padding', '5px');
    row
      .append('td')
      .text(country.prevalence)
      .style('border', '1px solid black')
      .style('padding', '5px');
    row
      .append('td')
      .text(country.population)
      .style('border', '1px solid black')
      .style('padding', '5px');
  });
}

function addButtonEventHandlers() {
  const highestCountry = countryData.find((c) => c.country === 'Kiribati');
  const lowestCountry = countryData.find(
    (c) => c.country === 'Sao Tome and Principe'
  );

  const buttons = d3.select('#buttons');

  // Event for the "Highest Prevalence" button
  buttons.select('#highestPrevalenceBtn').on('click', function () {
    highlightCountry(highestCountry);
  });

  // Event for the "Lowest Prevalence" button
  buttons.select('#lowestPrevalenceBtn').on('click', function () {
    highlightCountry(lowestCountry);
  });
}

// Global object to store country coordinates
let countryCoordinates = {};

// Load the CSV file with country codes and coordinates
function loadCountryCoordinates() {
  return d3.csv('./data/countries_codes_and_coordinates.csv').then((data) => {
    // Parse the data to extract ISO-3 codes, latitudes, and longitudes
    data.forEach((row) => {
      // Make sure to clean up any possible quotes and convert lat/lon to numbers
      const countryCode = row['Alpha-3 code'].replace(/"/g, '').trim(); // Remove quotes from ISO-3 code
      // remove extra spaces from the code

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

  // Play the audio
  const audio = document.getElementById('countryClickSound');
  audio.currentTime = 0; // Reset the audio to the start
  audio.play(); // Play the audio


  Plotly.relayout('vis', {
    'geo.center': {
      lat: coords.lat,
      lon: coords.lon,
    },
    'geo.projection.scale': 3, // Adjust scale as needed
  });

  // Update the country name and prevalence in the textStart div
  d3.select('#detailName').text(country.country);
  d3.select('#detailPreval').text(`${country.prevalence}%`);
}

// Global variable to hold the data for countries
let countryData = [];

// Call the main function to run the code
main();

console.log('Script loaded');
