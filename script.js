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
  return dataArray.map(function (dataItem) {
    return dataItem[key];
  });
}

// Load the CSV file using d3
function loadCSVData(csvFilePath) {
  return d3.csv(csvFilePath, d3.autoType);
}

// Function to process the data and prepare it for plotting
function processData(smokerData) {
  smokerData.forEach((row) => {
    countryData.push({
      population: row['Population']*row['Daily smoking prevalence - both (IHME, GHDx (2012))'],
      country: row['Entity'],
    });
  });
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
      hoverinfo: 'none',
      colorscale: [
        [0, '#F9E400'],
        [0.25, '#06D001'],
        [0.5, '#332FD0'],
        [0.75, '#AF47D2'],
        [1, '#F5004F'],
      ],
      zmin: 10067,
      zmax: 2707862957,
      colorbar: {
        title: {
          text: 'Smokers',
        },
      },
      autocolorscale: false,
    },
  ];
}

// Function to prepare the layout for the map
function prepareMapLayout() {
  return {
    title: {
      text: 'Total Smokers in the year 1997',
      x: 0.486,
      xanchor: 'center',
    },
    geo: {
      projection: {
        type: 'robinson',
      },
    },
    annotations: [],
  };
}

// Function to render the map using Plotly
function renderMap(plotData, layout) {
  Plotly.newPlot('myDiv', plotData, layout, { showLink: false });
}

// Global variable to hold the data for countries
let countryData = [];

// Call the main function to run the code
main();
