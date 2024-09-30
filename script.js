console.error = function(message) {
  // Ignore the violation if it's the Plotly warning
  if (message.includes("plotly-2.34.0.min.js:8 [Violation]Added non-passive event listener to a scroll-blocking 'wheel' event. Consider marking event handler as 'passive' to make the page more responsive. See ")) {
    return;
  }
  // Otherwise, log the error as usual
  console.log(message);
};
rows = [];

function unpack(rows, key) {
  return rows.map(function(row) {
    return row[key];
  });
}

// Read the CSV file
// d3.csv("./InvestigacionMaximos/data/Population-Smokers-2010.csv", function(error, data) {
//   if (error) {
//     rows.push({
//       "population": error['Population'],
//       "country": error['Entity']
//     })

//     var data = [{
//       type: 'choropleth',
//       locationmode: 'country names',
//       locations: unpack(rows, 'country'),
//       z: unpack(rows, 'population'),
//       text: unpack(rows, 'country'),
//       hoverinfo: 'none',
//       colorscale: [
//     [0, '#F9E400'],
//     [0.25, "#06D001"],
//     [0.5, "#332FD0"],
//     [0.75,'#AF47D2'],
//     [1, '#F5004F']
//     ],
//       zmin: 10067,
//       zmax: 2707862957      ,
//       colorbar: {
//         title: {
//           text: "Fumadores"
//         }
//       },
//       autocolorscale: false
//     }];
  
      
  
//       // Create the layout
//     var annotations = [];
  
//     var layout = {
//       title: {
//         text: 'Fumadores totales en el año 2010',
//         x: 0.48,
//         xanchor: 'center'
//       },
//       geo: {
//         projection: {
//         type: 'robinson'
//         }
//       },
//       annotations: annotations
//     };
  
//       // Call Plotly.newPlot outside of the d3.csv callback function
//     plotMap(data, layout);
    

//     return;
//   }
//   });

// d3.csv("./InvestigacionMaximos/data/Population-Smokers-1997.csv", function(error, data) {
//   if (error) {
//     rows.push({
//       "population": error['Population'],
//       "country": error['Entity']
//     })

//     var data = [{
//       type: 'choropleth',
//       locationmode: 'country names',
//       locations: unpack(rows, 'country'),
//       z: unpack(rows, 'population'),
//       text: unpack(rows, 'country'),
//       hoverinfo: 'none',
//       colorscale: [
//     [0, '#F9E400'],
//     [0.25, "#06D001"],
//     [0.5, "#332FD0"],
//     [0.75,'#AF47D2'],
//     [1, '#F5004F']
//     ],
//       zmin: 10067,
//       zmax: 2707862957      ,
//       colorbar: {
//         title: {
//           text: "Fumadores"
//         }
//       },
//       autocolorscale: false
//     }];
  
      
  
//       // Create the layout
//     var annotations = [];
  
//     var layout = {
//       title: {
//         text: 'Fumadores totales en el año 1997',
//         x: 0.48,
//         xanchor: 'center'
//       },
//       geo: {
//         projection: {
//         type: 'robinson'
//         }
//       },
//       annotations: annotations
//     };
  
//       // Call Plotly.newPlot outside of the d3.csv callback function
//     plotMap(data, layout);
    

//     return;
//   }
//   });


d3.csv("./InvestigacionMaximos/data/Population-Smokers-1997.csv", function(error, data) {
  if (error) {
    rows.push({
    "population": 0,
    "country": error['Entity']
    })
  }
  var data = [{
    type: 'choropleth',
    locationmode: 'country names',
    locations: unpack(rows, 'country'),
    z: unpack(rows, 'population'),
    text: unpack(rows, 'country'),
    hoverinfo: 'none',
    colorscale: [
    [0, '#F9E400'],
    [0.25, "#06D001"],
    [0.5, "#332FD0"],
    [0.75,'#AF47D2'],
    [1, '#F5004F']
    ],
    zmin: 10067,
    zmax: 2707862957      ,
    colorbar: {
      title: {
        text: "Fumadores"
      }
    },
    autocolorscale: false
  }];
  
  var annotations = [];
      
  var layout = {
    title: {
      text: 'Fumadores totales en el año XXXX',
      x: 0.48,
      xanchor: 'center'
    },
    geo: {
      projection: {
        type: 'robinson'
      }
    },
    annotations: annotations
  };
      
          // Call Plotly.newPlot outside of the d3.csv callback function
  plotMap(data, layout);
  return;
});


// Define a function to plot the map
function plotMap(data, layout) {
  Plotly.newPlot("myDiv", data, layout, {showLink: false});
}