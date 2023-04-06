// Geog 575 Lab 2

// wrapper function
(function () {

    // pseudo-global variables
    // variables for data join
    var attrArray = ["County", "Pop2022", "AreaSqMi", "Reg_DEM", "Reg_REP", "Reg_IAP", "Reg_LPN", "Reg_Other", "Reg_NonP", "Gov_DEM", "Gov_REP", "Gov_IAP", "Gov_LPN", "Gov_None", "Sen_DEM", "Sen_REP", "Sen_IAP", "Sen_LPN", "Sen_NPP", "Sen_None", "Turnout"];

    var expressed = attrArray[20]; // initial attribute
    //console.log(expressed);

    // width and height for outer gray container
    var w = 900, h = 500;

   
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

    //call setMap() when window loads
    window.onload = setMap();


    // set up choropleth map
    function setMap() {
        // map frame dimenstions, tall an dnarrow for the trapezoid state
        var width = window.innerWidth * 0.5,
            height = 460;

        // create new svg container for the map
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        // create Albers Equal Area conic projection centered on Nevada
        var projection = d3.geoAlbers()
            .center([0, 38.5])
            .rotate([117, 0, 0]) //weird that west longitude is positive for d3
            .parallels([36, 41])
            .scale(3500) // scale - larger is bigger, this fits NV nicely N-S in the 460px tall frame
            .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);

        // use Promise.all() to parallelize asynchronius data loading
        var promises = [];
        promises.push(d3.csv("data/NVvoters.csv")); //load attributes from csv,
        promises.push(d3.json("data/NVCounties_geog_noattr.topojson")); // load choropleth spatial data,
        promises.push(d3.json("data/States2.topojson")); // load background spatial data
        Promise.all(promises).then(callback);

        function callback(data) {
            var csvData = data[0],
                counties = data[1],
                state = data[2];
            //console.log(csvData);
            //console.log(counties);
            // console.log(state);

            // place graticule on map
            setGraticule(map, path);

            //translate the Nevada TopoJSON
            var states = topojson.feature(state, state.objects.States2);
            var nevadaCounties = topojson.feature(counties, counties.objects.NVCounties_geog_noattr).features; // object was called "NVCounties_geog_noattr" even tho the file was called NVCounties_geog_noattr_simp40.topojson

            //examine the results
            // console.log(nevadaState);
            // console.log(nevadaCounties);

            //add state outlines to the map as a background
            var nvStates = map.append("path")
                .datum(states)
                .attr("class", "states")
                .attr("d", path);



            // jon csv data to GeoJSON enumeration units
            nevadaCounties = joinData(nevadaCounties, csvData);

            // create color Scale
            var colorScale = makeColorScale(csvData);
            
            // add enumeration units to map
            setEnumerationUnits(nevadaCounties, map, path, colorScale);

            // add coordinated visualization to map
            setChart(csvData, colorScale);



        }; // end callback()

    }; // end setMap()

    function setGraticule(map, path) {
        // I don't need a graticule background for my Nevada map, I'll use the neighboring states as the background

        // create graticule generator
        var graticule = d3.geoGraticule()
            .step([2, 2]) // place graticule lines ever 2 degrees of longitude and latitude

        // add a gray background to the graticule
        var gratBackground = map.append("path")
            .datum(graticule.outline()) // bind graticule background
            .attr("class", "gratBackground") // assign class for styling
            .attr("d", path) // project graticule

        // add graticule lines to the map    
        var gratLines = map.selectAll(".gratLines") // select graticule elements that will be created
            .data(graticule.lines()) // bind graticule lines to each element to be created
            .enter() // create an element on each datum
            .append("path") // append each element to the svg as a path element
            .attr("class", "gratLines") // assign class for styling
            .attr("d", path); // project graticule lines
    }; // end setGraticule()

    function joinData(nevadaCounties, csvData) {
        // loop through csv to assign each set of csv attribute values to geojson region
        for (var i = 0; i < csvData.length; i++) {
            var csvRegion = csvData[i]; // the current region
            var csvKey = csvRegion.County; // the csv primary key

            // loop through geojson regions to find correct region
            for (var a = 0; a < nevadaCounties.length; a++) {
                var geojsonProps = nevadaCounties[a].properties; // the current region geojson properties
                var geojsonKey = geojsonProps.NAME; // the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey) {
                    // assign all attributes and values
                    attrArray.forEach(function (attr) {
                        var val = parseFloat(csvRegion[attr]); // get csv attribute value
                        geojsonProps[attr] = val; // assign attribute and value to geojson proerties
                    });
                };
            };

        };
        //console.log(nevadaCounties);

        return nevadaCounties;
    }; // end joinData()

    function setEnumerationUnits(nevadaCounties, map, path, colorScale) {
        // add Counties to map
        var nvCounties = map.selectAll(".nvCounties")
            .data(nevadaCounties)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "counties " + d.properties.NAME;
            })
            .attr("d", path)
            .style("fill", function(d){
                var value = d.properties[expressed];
                if (value) {
                    return colorScale(d.properties[expressed]);
                } else {
                    return "#ccc";
                }
            });
    }; // end setEnumeration Units

    // function to create color scale generator
    function makeColorScale(data) {
        var colorClasses = [
            "#f1eef6",
            "#bdc9e1",
            "#74a9cf",
            "#2b8cbe",
            "#045a8d"
        ];

        // create color scale generator
        var colorScale = d3.scaleThreshold()
            .range(colorClasses);

        //build an arrray of all values of the expressed attribute
        var domainArray = [];
        for (var i = 0; i<data.length; i++) {
            var val = parseFloat(data[i][expressed]);
            //console.log("val " + val);
            domainArray.push(val);
        };

        //console.log(domainArray);

        // cluster data using ckmeans clustering algorithm to create natural breaks
        var clusters = ss.ckmeans(domainArray, 5);
        // reset domain array to cluster minimums
        domainArray = clusters.map(function (d) {
            return d3.min(d);
        });

        //console.log(clusters);

        // remove first value from domain array to create class breakpoints
        domainArray.shift();

        // assign array of last 4 cluster minimums as domain
        colorScale.domain(domainArray);

        return colorScale;
    }; // end makeColorScale()

 //execute setChart() when window is loaded
 //window.onload = setChart();

    function setChart(csvData, colorScale) {
        // chart frame dimentions
        var chartWidth = window.innerWidth * 0.425,
            chartHeight = 473,
            leftPadding = 25,
            rightPadding = 2,
            topBottomPadding = 5,
            chartInnerWidth = chartWidth - leftPadding - rightPadding,
            chartInnerHeight = chartHeight - topBottomPadding * 2,
            translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

        // create a second svg element to hold the bar chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        // create a rectangle for chart background fill
        var chartBackground = chart.append("rect")
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);


        // create a scale to size bars proportionally to frame
        var yScale = d3.scaleLinear()
            .range([463, 0])
            .domain([0, 100]);

        // set bars for each county
        var bars = chart.selectAll(".bars")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function (a, b) {
                return b[expressed] - a[expressed]
            })
            .attr("class", function (d) {
                return "bars " + d.County;
            })
            .attr("width", chartInnerWidth / csvData.length - 1)
            .attr("x", function (d, i) {
                return i * (chartInnerWidth / csvData.length) + leftPadding;
            })
            .attr("height", function (d) {
                return 463 - yScale(parseFloat(d[expressed] * 100));
            })
            .attr("y", function (d) {
                return yScale(parseFloat(d[expressed] * 100)) + topBottomPadding;
            })
            .style("fill", function (d) {
                return colorScale(d[expressed]);
            });

        var chartTitle = chart.append("text")
            .attr("x", 40)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text("Percent Voter Turnout in Each County");
            
        var chartSubtitle = chart.append("text")
            .attr("x", 40)
            .attr("y", 60)
            .attr("class", "chartSubtitle")
            .text("Nevada 2022 General Election");


        // annotate bars with attribute value text
        var numbers = chart.selectAll(".numbers")
            .data(csvData)
            .enter()
            .append("text")
            .sort(function (a, b) {
                return b[expressed] - a[expressed]
            })
            .attr("class", function (d) {
                return "numbers " + d.County;
            })
            .attr("text-anchor", "middle")
            .attr("x", function (d, i) {
                var fraction = chartInnerWidth / csvData.length;
                return 25 + (i * fraction) + ((fraction - 1) / 2);
            })
            .attr("y", function (d) {
                return yScale(parseFloat(d[expressed]) * 100) + 15 + topBottomPadding
            })
            .text(function (d) {
                return Math.round(d[expressed] * 100);
            });

        // create vertical axis generator
        var yAxis = d3.axisLeft()
            .scale(yScale);

        //place axis
        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        // create frame for chart border
        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
         .attr("transform", translate);

 }; // end setChart()


})(); // end of wrapper function