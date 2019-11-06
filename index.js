'use strict';

(function () {

  let data = "no data";
  let allData = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  let mapFunctions = "";
  let legendarySelected = "All";
  let generationSelected = "All";

  const colors = {
    "Bug": "#4E79A7",
    "Dark": "#A0CBE8",
    "Electric": "#F28E2B",
    "Fairy": "#FFBE&D",
    "Fighting": "#59A14F",
    "Fire": "#8CD17D",
    "Ghost": "#B6992D",
    "Grass": "#499894",
    "Ground": "#86BCB6",
    "Ice": "#86BCB6",
    "Normal": "#E15759",
    "Poison": "#FF9D9A",
    "Psychic": "#79706E",
    "Steel": "#BAB0AC",
    "Water": "#D37295"

  }

  // load data and make scatter plot after window loads
  window.onload = function () {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 800);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/pokemon.csv")
      .then((data) => {
        data = data
        allData = data
        makeScatterPlot("all")
      }
      );
  }

  function filterByGeneration(gen) {
    if (gen == "all") {
      data = allData
    } else {
      data = allData.filter((row) => row["Generation"] == gen)
    }
  }

  function makeScatterPlot(gen) {
    filterByGeneration(gen)

    // get arrays of total stats and special defense
    let total_stat_data = data.map((row) => parseFloat(row["Total"]));
    let sp_def_data = data.map((row) => parseFloat(row["Sp. Def"]));

    // find data limits
    let axesLimits = findMinMax(sp_def_data, total_stat_data);

    // draw axes and return scaling + mapping functions
    mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    var legDropDown = d3.select("body").append("select").attr("class", "leg-selector")

    var legOptions = ["All", "True", "False"]
    legDropDown
      .selectAll('myOptions')
      .data(legOptions)
      .enter()
      .append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; });

    legDropDown.on("change", function () {
      legendarySelected = d3.select(this).property("value");
      var displayOthers = this.checked ? "inline" : "none";
      var display = this.checked ? "none" : "inline";

      if (legendarySelected == "All" && generationSelected == "All") {
        svgContainer.selectAll("circle")
          .attr("display", display);
      } else if (legendarySelected != "All" && generationSelected == "All") {
        svgContainer.selectAll("circle")
          .filter(function (d) { return legendarySelected != d.Legendary; })
          .attr("display", displayOthers);

        svgContainer.selectAll("circle")
          .filter(function (d) { return legendarySelected == d.Legendary; })
          .attr("display", display);
      } else if (legendarySelected == "All" && generationSelected != "All") {
        svgContainer.selectAll("circle")
          .filter(function (d) { return generationSelected != d.Generation; })
          .attr("display", displayOthers);

        svgContainer.selectAll("circle")
          .filter(function (d) { return generationSelected == d.Generation; })
          .attr("display", display);
      } else if (legendarySelected != "All" && generationSelected != "All") {
        svgContainer.selectAll("circle")
          .filter(function (d) { return generationSelected != d.Generation || legendarySelected != d.Legendary; })
          .attr("display", displayOthers);

        svgContainer.selectAll("circle")
          .filter(function (d) { return generationSelected == d.Generation && legendarySelected == d.Legendary; })
          .attr("display", display);
      }
    });

    var genDropDown = d3.select("body").append("select").attr("class", "gen-selector")

    var genDefaultOption = genDropDown.append("option")
      .data(data)
      .text("All")
      .attr("value", "All")
      .enter();
    var genOptions = genDropDown.selectAll("option.state")
      .data(d3.map(data, function (d) { return d.Generation }).keys())
      .enter()
      .append("option")
      .text(function (d) { return d; });

    genDropDown.on("change", function () {
      generationSelected = d3.select(this).property("value");
      var displayOthers = this.checked ? "inline" : "none";
      var display = this.checked ? "none" : "inline";

      if (legendarySelected == "All" && generationSelected == "All") {
        svgContainer.selectAll("circle")
          .attr("display", display);
      } else if (legendarySelected != "All" && generationSelected == "All") {
        svgContainer.selectAll("circle")
          .filter(function (d) { return legendarySelected != d.Legendary; })
          .attr("display", displayOthers);

        svgContainer.selectAll("circle")
          .filter(function (d) { return legendarySelected == d.Legendary; })
          .attr("display", display);
      } else if (legendarySelected == "All" && generationSelected != "All") {
        svgContainer.selectAll("circle")
          .filter(function (d) { return generationSelected != d.Generation; })
          .attr("display", displayOthers);

        svgContainer.selectAll("circle")
          .filter(function (d) { return generationSelected == d.Generation; })
          .attr("display", display);
      } else if (legendarySelected != "All" && generationSelected != "All") {
        svgContainer.selectAll("circle")
          .filter(function (d) { return generationSelected != d.Generation || legendarySelected != d.Legendary; })
          .attr("display", displayOthers);

        svgContainer.selectAll("circle")
          .filter(function (d) { return generationSelected == d.Generation && legendarySelected == d.Legendary; })
          .attr("display", display);
      }
    });

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();
    createLegend();
  }

  function createLegend() {
    var size = 20
    svgContainer.selectAll("mydots")
      .data(d3.map(data, function (d) { return d["Type 1"] }).keys())
      .enter()
      .append("rect")
      .attr("x", 100)
      .attr("y", function (d, i) { return 100 + i * (size + 5) })
      .attr("width", size)
      .attr("height", size)
      .style("fill", function (d) { return colors[d] })
      .attr("transform", "translate(675,130)")

    // Add one dot in the legend for each name.
    svgContainer.selectAll("mylabels")
      .data(d3.map(data, function (d) { return d["Type 1"] }).keys())
      .enter()
      .append("text")
      .attr("x", 100 + size * 1.2)
      .attr("y", function (d, i) { return 100 + i * (size + 5) + (size / 2) })
      .style("fill", function (d) { return colors[d] })
      .text(function (d) { return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
      .attr("transform", "translate(675,130)")
  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 150)
      .attr('y', 40)
      .style('font-size', '25pt')
      .text("Pokemon - Special Defense v.s. Total Stats");

    svgContainer.append('text')
      .attr('x', 312.5)
      .attr('y', 775)
      .style('font-size', '15pt')
      .text('Special Defense');

    svgContainer.append('text')
      .attr('transform', 'translate(30, 425)rotate(-90)')
      .style('font-size', '15pt')
      .text('Total Stats');
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function (d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 10, limits.xMax + 10]) // give domain buffer room
      .range([75, 725]);

    // xMap returns a scaled x value from a row of data
    let xMap = function (d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 725)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function (d) { return +d[y] }

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 50, limits.yMin - 50]) // give domain buffer
      .range([75, 725]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(75, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  function plotData(map) {
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', xMap)
      .attr('cy', yMap)
      .attr('r', 5)
      .attr('fill', function (d) { return colors[d["Type 1"]] })
      // add tooltip functionality to points
      .on("mouseover", (d) => {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html(d.Name + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax
    }
  }
})();
