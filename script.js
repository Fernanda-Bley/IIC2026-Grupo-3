const SVG = d3.select('#vis').append('SVG');

// Editar tamaños como estime conveniente
const WIDTH_VIS = 1200;
const HEIGHT_VIS = 250;

const MARGIN = {
  top: 50,
  bottom: 50,
  right: 50,
  left: 50,
};
const HEIGHTVISINSIDE = HEIGHT_VIS - MARGIN.top - MARGIN.bottom;
const WIDTHVISINSIDE = WIDTH_VIS - MARGIN.right - MARGIN.left;

SVG.attr('width', WIDTH_VIS).attr('height', HEIGHT_VIS);

// Main function to initiate the entire process

function main() {
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
      population: row['Daily smoking prevalence - both (IHME, GHDx (2012))'],
      country: row['Entity'],
    });
  });
}

// Function to find the top 3 countries with the highest smoking prevalence
function findTop3Countries() {
  return countryData.sort((a, b) => b.population - a.population).slice(0, 3);
}

// Function to prepare plot data for Plotly
function preparePlotData() {
  return [
    {
      type: 'choropleth',
      locationmode: 'country names',
      locations: extractData(countryData, 'country'),
      z: extractData(countryData, 'population'),
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

  // Add a group for annotations
  const g = SVG.append('g');

  // Call the function to add prevalence annotations
  addPrevalenceAnnotations(g);

  // Get the top 3 countries with the highest smoking prevalence
  const top3Countries = findTop3Countries();

  // Add a table to display the top 3 countries
  addTop3Table(top3Countries);

  // Add hover interaction
  addHoverInteraction();

  // Add button event handlers
  addButtonEventHandlers();
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
  });

  // Handle unhover events to clear the displayed details
  vis.on('plotly_unhover', () => {
    // Clear the info when the mouse is not hovering over the map
    d3.select('#detailName').text('');
    d3.select('#detailPreval').text('');
  });
}

// Function to add rectangles, arrows, and text annotations for prevalences
function addPrevalenceAnnotations(g) {
  // Add rectangle for highest prevalence
  g.append('rect')
    .attr('x', 595)
    .attr('y', 270)
    .attr('width', 100)
    .attr('height', 30)
    .attr('fill', '#0002A1');

  // Add text annotation for highest prevalence
  g.append('text')
    .attr('x', 598)
    .attr('y', 280)
    .attr('font-size', 12)
    .attr('fill', '#FFFFFF')
    .text('Mayor prevaliencia:');

  // Add country name for highest prevalence
  g.append('text')
    .attr('x', 620)
    .attr('y', 295)
    .attr('font-size', 12)
    .attr('fill', '#FFFFFF')
    .text('Kiribati');

  // Add rectangle for lowest prevalence
  g.append('rect')
    .attr('x', 290)
    .attr('y', 390)
    .attr('width', 325)
    .attr('height', 30)
    .attr('fill', '#00CCDD');

  // Add text annotation for lowest prevalence
  g.append('text')
    .attr('x', 292)
    .attr('y', 400)
    .attr('font-size', 12)
    .attr('fill', '#000000')
    .text('Menor prevalencia:');

  // Add country name for lowest prevalence
  g.append('text')
    .attr('x', 300)
    .attr('y', 415)
    .attr('font-size', 12)
    .attr('fill', '#000000')
    .text('República Democrática de São Tomé e Príncipe');

  // Add arrows using lines and polygons for pointers
  g.append('line')
    .attr('x1', 650)
    .attr('y1', 300)
    .attr('x2', 650)
    .attr('y2', 320)
    .attr('stroke', '#000')
    .attr('stroke-width', 2);

  g.append('polygon')
    .attr('points', '650,320 660,310 640,310')
    .attr('fill', '#000');

  g.append('line')
    .attr('x1', 370)
    .attr('y1', 295)
    .attr('x2', 301)
    .attr('y2', 390)
    .attr('stroke', '#000')
    .attr('stroke-width', 2);

  g.append('polygon')
    .attr('points', '371,290 355,300 370,310')
    .attr('fill', '#000');
}

// Function to add a table to display the top 3 countries with the highest smoking prevalence
function addTop3Table(top3Countries) {
  const tableContainer = d3
    .select('#vis')
    .append('div')
    .attr('id', 'top3-table')
    .style('position', 'absolute')
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
      .text(country.population)
      .style('border', '1px solid black')
      .style('padding', '5px');
  });
}

function addButtonEventHandlers() {
  const highestCountry = {
    name: 'Kiribati', // This is your highest prevalence country
    lat: 1.8709, // Approximate latitude of the country
    lon: 157.363, // Approximate longitude of the country
    prevalence: 50.0, // Replace with the actual value from your dataset
  };

  const lowestCountry = {
    name: 'República Democrática de São Tomé e Príncipe', // Lowest prevalence country
    lat: 0.18636, // Approximate latitude
    lon: 6.613081, // Approximate longitude
    prevalence: 3.2, // Replace with the actual value from your dataset
  };

  // Event for the "Highest Prevalence" button
  document
    .getElementById('highestPrevalenceBtn')
    .addEventListener('click', function () {
      highlightCountry(highestCountry);
    });

  // Event for the "Lowest Prevalence" button
  document
    .getElementById('lowestPrevalenceBtn')
    .addEventListener('click', function () {
      highlightCountry(lowestCountry);
    });
}

// Function to highlight a specific country on the map
function highlightCountry(country) {
  Plotly.relayout('vis', {
    'geo.center': {
      lon: country.lon,
      lat: country.lat,
    },
    'geo.projection.scale': 10, // Zoom into the country (adjust scale as needed)
  });

  // Display the country name and prevalence in your custom detail section
  d3.select('#detailName').text(country.name);
  d3.select('#detailPreval').text(`${country.prevalence}% prevalence`);
}

// Global variable to hold the data for countries
let countryData = [];

// Call the main function to run the code
main();
