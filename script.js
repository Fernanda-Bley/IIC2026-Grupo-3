const SVG = d3.select('#vis').append('SVG');

// Editar tamaños como estime conveniente
const WIDTH_VIS = 1200;
const HEIGHT_VIS = 250;
var actual_year = 1997; 

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
    loadCSVData('data/Daily-Smokers.csv')
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

  // Slider event to change the year
  d3.select('#yearSlider').on('input', function() {
    actual_year = +this.value; // Update the actual_year variable
    console.log('Selected Year:', actual_year);

    // Reload the data based on the new year
    loadCSVData('data/Daily-Smokers.csv')
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
  countryData = []; // Reset countryData for each year
  smokerData.forEach((row) => {
    // Check if the year is the selected year
    if (row['Year'] === actual_year) {
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
      text: `Porcentaje de fumadores diarios en ${actual_year}`,
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

function addTop3Table(top3Countries) {
  // Limpiar el contenedor de la tabla antes de agregar nuevos datos
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

  // Agregar encabezados a la tabla
  const header = table.append('thead').append('tr');
  header
    .append('th')
    .text('País')
    .style('border', '0px solid black')
    .style('padding', '10px')
    .style('width', '100px'); // Anchura fija para la celda del país
  header
    .append('th')
    .text('Prevalencia (%)')
    .style('border', '0px solid black')
    .style('text-align', 'center')
    .style('padding', '10px')
    .style('width', '200px'); // Anchura fija para la celda de prevalencia

  // Cuerpo de la tabla
  const tbody = table.append('tbody');
  top3Countries.forEach(country => {
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

    // Celda de prevalencia que contiene el SVG
    const prevalenceCell = row.append('td')
      .style('border', '0px solid black')
      .style('padding', '10px')
      .style('height', '40px')
      .style('width', '200px')
      .style('overflow', 'hidden');

    // SVG para la barra de prevalencia
    const svg = prevalenceCell.append('svg')
      .style('border', '1px solid black')
      .attr('width', '100%')
      .attr('height', '100%');

    const prevalenceWidth = (country.prevalence / 100) * 200;

    // Agregar el rectángulo que representa la prevalencia
    svg.append('rect')
      .attr('width', prevalenceWidth)
      .attr('height', '100%')
      .attr('fill', '#0002A1')
      .attr('y', 0);

    // Agregar el texto que muestra el porcentaje de prevalencia con 1 decimal dentro del SVG
    svg.append('text')
      .attr('x', prevalenceWidth - 10) // Posición ajustada cerca del final del rectángulo
      .attr('y', '50%') // Centrado verticalmente
      .attr('dy', '0.35em') // Ajuste de alineación vertical
      .attr('text-anchor', 'end') // Alineación del texto al final del rectángulo
      .style('fill', 'white')
      .style('font-size', '12px')
      .text(`${country.prevalence.toFixed(1)}%`);
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