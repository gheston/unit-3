// code from early part of lab 2 - chart with 4 Wisconsin cities, not needed in the rest of Lab 2


function OLDsetChart() {
    var container = d3.select("body") //get the <body> element from the DOM
        .append("svg") // put a new svg in the body
        .attr("width", w) // assign the width
        .attr("height", h) // assign the height
        .attr("class", "container") // always assign a class (as the block name) for styling and future selection
        .style("background-color", "rgba(0,0,0,0.2)");

    // innerRect block
    var innerRect = container.append("rect") // add a <rect> element
        .datum(400)
        .attr("width", function (d) { // rectangle width
            return d * 2; //400 * 2 = 800
        })

        .attr("height", function (d) {
            return d; //rectangle height
        })
        .attr("class", "innerRect") // class name
        .attr("x", 50) // position from left on the x (horizontal) axis
        .attr("y", 50) // positio from left on the y (vertical) axis
        .style("fill", "#FFFFFF"); // fill color

    // demo array for 5 circles
    var dataArray = [10, 20, 30, 40, 50];

    // array of cities and population
    var cityPop = [
        {
            city: 'Madison',
            population: 233209
        },
        {
            city: 'Milwaukee',
            population: 594833
        },
        {
            city: 'Green Bay',
            population: 104057
        },
        {
            city: 'Superior',
            population: 27244
        }
    ];

    // find the minimum value of the citiPop array
    var minPop = d3.min(cityPop, function (d) {
        return d.population;
    });

    //find the maximum value of the citiPop array
    var maxPop = d3.max(cityPop, function (d) {
        return d.population;
    });

    // create the scale generator for X axis
    var x = d3.scaleLinear()
        .range([90, 755]) // output min and max
        .domain([0, 3]); // input min and max

    // create the scale generator for y axis   
    var y = d3.scaleLinear()
        .range([450, 50])
        .domain([
            0, // was minPop
            700000 // was maxPop - made them go a bit beyond to make the axis look better
        ]);

    // color scale generator
    var color = d3.scaleLinear()
        .range([
            "#FDBE85", // pale orange for lower values
            "#D94701" // red-orange for higher values
        ])
        .domain([
            minPop,
            maxPop
        ]);

    // circle container
    var circles = container.selectAll(".circles")
        .data(cityPop) // here we feed an array
        .enter() //one of the great mysteries of the universe
        .append("circle") // add a circle for each datum
        .attr("class", "circles") // apply a class name to all circles
        .attr("id", function (d) {
            return d.city;
        })
        .attr("r", function (d, i) {
            // calculate the radius based on population value as circle area
            var area = d.population * 0.01;
            return Math.sqrt(area / Math.PI);
        })
        .attr("cx", function (d, i) {
            //use the scale generator with the index to place each circle horizontally
            return x(i);
        })
        .attr("cy", function (d) {
            //subtract value from 450 to "grow" circles up from bottom instead of down from the top of the SVG
            return y(d.population);
        })
        .style("fill", function (d, i) { // add a fill based on the color scale generator
            return color(d.population);
        })
        .style("stroke", "#000"); // black circle stroke

    // y axis generator
    var yAxis = d3.axisLeft(y);

    // create axis <g> element and add axis
    var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50,0)")
        .call(yAxis);

    // chart title container
    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("City Populations");

    // label container    
    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("y", function (d) {
            //vertical position centered on each circle
            return y(d.population) - 3; // adjusted to make the 2-line label centered on each circle
        });

    // first line of label
    var nameLine = labels.append("tspan")
        .attr("class", "nameLine")
        .attr("x", function (d, i) {
            // horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .text(function (d) {
            return d.city;
        });

    // comma-formated number generator
    var format = d3.format(",");

    // second line of label
    var popLine = labels.append("tspan")
        .attr("class", "popLine")
        .attr("x", function (d, i) {
            // horizontal position to the right of each circle
            return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
        })
        .attr("dy", "15") // vertical offset from the name line
        .text(function (d) {
            return "Pop. " + format(d.population); // formats the population using the format() generator
        });
}; // end OLDsetChart()