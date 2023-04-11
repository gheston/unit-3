// Geog 575 Lab 2

// wrapper function
(function () {

    // pseudo-global variables
    // variables for data join

    var attrArray = ["County", "Category", "Pop2022", "AreaSqMi", "Reg_NV_Pct", "Reg_DEM_Pct", "Reg_REP_Pct", "Reg_IAP_Pct", "Reg_LPN_Pct", "Reg_Other_Pct", "Reg_NonP_Pct", "Gov_DEM_Pct", "Gov_REP_Pct", "Gov_IAP_Pct", "Gov_LPN_Pct", "Gov_None_Pct", "Sen_DEM_Pct", "Sen_REP_Pct", "Sen_IAP_Pct", "Sen_LPN_Pct", "Sen_NPP_Pct", "Sen_None_Pct", "Turnout_Pct"];

    // array of CSV attribute names with long name aliases
    var attrArrayWithLongNames = [
        { fieldName: "County", longName: "County" },
        { fieldName: "Category", longName: "Urban or Rural" },
        { fieldName: "Pop2022", longName: "Population 2022" },
        { fieldName: "AreaSqMi", longName: "Area (square miles)" }, { fieldName: "Reg_NV_Pct", longName: "% of State's Registered Voters" },
        { fieldName: "Reg_DEM_Pct", longName: "% Democratic Party Voters" },
        { fieldName: "Reg_REP_Pct", longName: "% Republican Party Voters" },
        { fieldName: "Reg_IAP_Pct", longName: "% Independent American Party Voters" },
        { fieldName: "Reg_LPN_Pct", longName: "% Libertarian Party Voters" },
        { fieldName: "Reg_Other_Pct", longName: "% Other Party Voters" },
        { fieldName: "Reg_NonP_Pct", longName: "% Nonpartisan Voters" },
        { fieldName: "Gov_DEM_Pct", longName: "% Voted for Democratic Governor Candidate" },
        { fieldName: "Gov_REP_Pct", longName: "% Voted for Republican Governor Candidate" },
        { fieldName: "Gov_IAP_Pct", longName: "% Voted for Independent American Governor Candidate" },
        { fieldName: "Gov_LPN_Pct", longName: "% Voted for Libertarian Governor Candidate" },
        { fieldName: "Gov_None_Pct", longName: "% Voted for 'None of These' Governor Candidates" },
        { fieldName: "Sen_DEM_Pct", longName: "% Voted for Democratic Senator Candidate" },
        { fieldName: "Sen_REP_Pct", longName: "% Voted for Republican Senator Candidate" },
        { fieldName: "Sen_IAP_Pct", longName: "% Voted for Independent American Senator Candidate" },
        { fieldName: "Sen_LPN_Pct", longName: "% Voted for Libertarian Senator Candidate" },
        { fieldName: "Sen_NPP_Pct", longName: "% Voted for Nonpartisan Senator Candidate" },
        { fieldName: "Sen_None_Pct", longName: "% Voted for 'None of These' Senator Candidates" },
        { fieldName: "Turnout_Pct", longName: "% Voter Turnout" }
    ];

    // array of variables without the descriptiive attributes
    var attrArrayShorter = ["Reg_NV_Pct", "Reg_DEM_Pct", "Reg_REP_Pct", "Reg_IAP_Pct", "Reg_LPN_Pct", "Reg_Other_Pct", "Reg_NonP_Pct", "Gov_DEM_Pct", "Gov_REP_Pct", "Gov_IAP_Pct", "Gov_LPN_Pct", "Gov_None_Pct", "Sen_DEM_Pct", "Sen_REP_Pct", "Sen_IAP_Pct", "Sen_LPN_Pct", "Sen_NPP_Pct", "Sen_None_Pct", "Turnout_Pct"];


    var expressed = attrArray[4]; // initial attribute
    //console.log(expressed);

    // width and height for outer gray container
    //var w = 900, h = 500;

    // chart frame dimentions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473, // outer dimensions to include the X axis county labels
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - (topBottomPadding * 2) - 100, //100 for the county labels
        translate = "translate(" + leftPadding + "," + (topBottomPadding) + ")";

    // create a scale to size bars proportionally to frame
    var yScale = d3.scaleLinear()
        .range([363, 0])
        .domain([0, 100]);

    //call setMap() when window loads
    window.onload = setMap();

    // set up choropleth map
    function setMap() {
        // map frame dimenstions, tall an dnarrow for the trapezoid state
        var width = window.innerWidth * 0.5,
            height = 460;

        // create new svg container for the map
        var map = d3.select(".nevadaMap")
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
        promises.push(d3.csv("data/NVvotersNormalized.csv")); //load attributes from csv,
        promises.push(d3.json("data/NVCounties_geog_noattr copy.topojson")); // load choropleth spatial data,
        promises.push(d3.json("data/States2.topojson")); // load background spatial data
        Promise.all(promises).then(callback);

        // callback - not sure why it only works within setMap() and not as its own function
        function callback(data) {
            var csvData = data[0],
                counties = data[1],
                state = data[2];
            // console.log("Csv data: ", csvData);
            // console.log(counties);
            // console.log(state);

            // place graticule on map
            setGraticule(map, path);

            //translate the Nevada TopoJSON
            var states = topojson.feature(state, state.objects.States2);
            var nevadaCounties = topojson.feature(counties, counties.objects.NVCounties_geog_noattr).features; // object was called "NVCounties_geog_noattr" even tho the file was called NVCounties_geog_noattr_simp40.topojson

            //examine the results
            // console.log(nevadaState);

            // console.log("Counties:", nevadaCounties);


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



            // add dropdown menu
            createDropdown(csvData);

        }; // end callback()

    }; // end setMap()

    function setGraticule(map, path) {

        // create graticule generator
        var graticule = d3.geoGraticule()
            .step([2, 2]) // place graticule lines ever 2 degrees of longitude and latitude
            .extent([[-126, 44], [-109, 34]]); // extents of NV

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
                        var val = csvRegion[attr]// get csv attribute value
                        if (typeof val === "string") {
                            geojsonProps[attr] = val; // assign attribute and value to geojson proerties
                        } else {
                            geojsonProps[attr] = parseFloat(val);
                        }

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
                var countyName = countyNameNoSpace(d.properties.NAME);
                return "counties " + countyName;
            })
            .attr("d", path)
            .style("fill", function (d) {
                var value = d.properties[expressed];
                if (value) {
                    return colorScale(value);
                } else {
                    return "#ccc";
                }
            })
            .on("mouseover", function (event, d) {
                highlight(d.properties);
            })
            .on("mouseout", function (event, d) {
                dehighlight(d.properties);
            })
            .on("mousemove", moveLabel);


        var desc = nvCounties.append("desc")
            .text('{"stroke": "#000", "stroke-width": "0.5px"}');

    }; // end setEnumeration Units

    // function to create color scale generator
    function makeColorScale(data) {
        var colorClasses = ['#fef0d9','#fdcc8a','#fc8d59','#e34a33','#b30000']; // ColorBrewer.org yellow-red

        // create color scale generator
        var colorScale = d3.scaleThreshold()
            .range(colorClasses);

        //build an arrray of all values of the expressed attribute
        var domainArray = [];
        for (var i = 0; i < data.length; i++) {
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

    function setChart(csvData, colorScale) {

        // create a second svg element to hold the bar chart
        var chart = d3.select(".barchart")
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


                        // add chart's x axis
                        makeXaxis(csvData);

        // set bars for each county
        var bars = chart.selectAll(".bars")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function (a, b) {
                return b["Pop2022"] - a["Pop2022"]; // I want to keep the sort in population order
            })
            .attr("class", function (d) {
                var countyName = countyNameNoSpace(d.County);
                return "bars " + countyName;
            })
            .attr("width", chartInnerWidth / csvData.length - 1)
            .on("mouseover", function (event, d) {
                highlight(d);
            })
            .on("mouseout", function (event, d) {
                dehighlight(d);
            })
            .on("mousemove", moveLabel);

        var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');

        var chartTitle = chart.append("text")
            .attr("x", 40)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text(expressed);

                        
        // annotate bars with attribute value text
        var numbers = chart.selectAll(".numbers")
            .data(csvData)
            .enter()
            .append("text")
            .sort(function (a, b) {
                return b["Pop2022"] - a["Pop2022"] // sort by population
                //return b[expressed] - a[expressed]
            })
            // .attr("class", function (d) {
            //     return "numbers " + d.County;
            // })
            .attr("class", "numbers") // take out the county name from the class, then they don't get highlighted on mouseover
            .attr("text-anchor", "middle")
            .attr("x", function (d, i) {
                var fraction = chartInnerWidth / csvData.length;
                return 25 + (i * fraction) + ((fraction - 1) / 2);
            })
            .attr("y", function (d) {
                return yScale(parseFloat(d[expressed])) + 15 + topBottomPadding
            })
            .text(function (d) {
                return Math.round(d[expressed]);
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
            .attr("height", chartInnerHeight + 100)
            .attr("transform", translate);

        //set bar positions, heights, and colors
        updateChart(bars, csvData.length, colorScale, numbers);

    }; // end setChart()

    // function to create a dropdown menu for attribute selection
    function createDropdown(csvData) {
        // add select element
        var dropdown = d3.select(".nevadaMap")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function () {
                changeAttribute(this.value, csvData)
            });

        // add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Attribute");

        // add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArrayShorter)
            .enter()
            .append("option")
            .attr("value", function (d) {
                return d;
            })
            .text(function (d) {
                var fieldNameIndex = attrArrayWithLongNames.findIndex(item => item.fieldName === d);
                return attrArrayWithLongNames[fieldNameIndex].longName
            });

    }; // end createDropdown()

    // dropdown change event handler
    function changeAttribute(attribute, csvData) {
        // change the expressed attribute
        expressed = attribute;

        // recreate the color scale
        var colorScale = makeColorScale(csvData);

        // recolor enumeration units
        var nevadaCounties = d3.selectAll(".counties")
            .transition()
            .duration(1000)
            .style("fill", function (d) {
                var value = d.properties[expressed];
                if (value) {
                    return colorScale(value);
                } else {
                    return "#ccc";
                }
            });

        //Sort, resize, and recolor bars
        var bars = d3.selectAll(".bars") // bar or bars?
            //Sort bars
            .sort(function (a, b) {
                return b["Pop2022"] - a["Pop2022"];
                //return b[expressed] - a[expressed];
            })
            .transition() // add animation
            .delay(function (d, i) {
                return i * 20
            })
            .duration(500);

        var numbers = d3.selectAll(".numbers")
            // sort numbers
            .sort(function (a, b) {
                return b["Pop2022"] - a["Pop2022"];
                //return b[expressed] - a[expressed];
            })
            .transition()
            .delay(function (d, i) {
                return i * 20
            })
            .duration(500);
        updateChart(bars, csvData.length, colorScale, numbers);

    }; // end changeAttribute()

    // function to position, size, and color bars in chart
    function updateChart(bars, n, colorScale, numbers) {

        // position bars
        bars.attr("x", function (d, i) {
            return i * (chartInnerWidth / n) + leftPadding;
        })
            .attr("height", function (d) {
                return 363 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function (d) {
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            .style("fill", function (d) {
                return colorScale(d[expressed]);
            })
            //recolor bars
            .style("fill", function (d) {
                var value = d[expressed];
                if (value) {
                    return colorScale(value);
                } else {
                    return "#ccc";
                }
            });

        // annotate bars with attribute value text, 

        numbers.attr("x", function (d, i) {
            var fraction = chartInnerWidth / n;
            return 25 + (i * fraction) + ((fraction - 1) / 2);
        })
            .attr("y", function (d) {
                if (d[expressed] > 6) { // if % <6 then the numbers are too low; move them up a bit
                    return yScale(parseFloat(d[expressed])) + 15 + topBottomPadding;
                } else {
                    return yScale(parseFloat(d[expressed])) - 5 + topBottomPadding;
                }
            })
            .text(function (d) {
                if (d[expressed] > 1) {
                    return Math.round(d[expressed]);
                } else {
                    return "<1"; // if <1% display as "<1" because the bars are so small
                }
            });

        // get the index of the expresed fieldName from attrArrayWithLongNames
        var expressedIndex = attrArrayWithLongNames.findIndex(item => item.fieldName === expressed);
        // console.log(expressed, ": Index", expressedIndex);
        // console.log("long name: ", attrArrayWithLongNames[expressedIndex].longName);


        // update chart title
        var chartTitle = d3.select(".chartTitle")
            .text(attrArrayWithLongNames[expressedIndex].longName);
    }; // end udateChart()

    // function to highlight enumeration units and bars
    function highlight(props) {
        // change stroke

        var countyName = countyNameNoSpace(props.County);

        var selected = d3.selectAll("." + countyName)
            .style("stroke", "#0DFC50")
            .style("stroke-width", "2");

            // var selected = d3.selectAll(".counties" + countyName)
            // .style("stroke", "red")
            // .style("stroke-width", "2");



        setLabel(props);

    }; // end highlight()

    function dehighlight(props) {

        var countyName = countyNameNoSpace(props.County);

        var selected = d3.selectAll("." + countyName)
            .style("stroke", function () {
                return getStyle(this, "stroke");
            })
            .style("stroke-width", function () {
                return getStyle(this, "stroke-width");
            });

            // var selected = d3.selectAll(".counties" + countyName)
            // .style("stroke", function () {
            //     return getStyle(this, "stroke");
            // })
            // .style("stroke-width", function () {
            //     return getStyle(this, "stroke-width");
            // });

            d3.select(".infolabel") // remove the floating label
            .remove();

    } // end dehighlight()

    function getStyle(element, styleName) {
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);
        //console.log(styleObject);

        return styleObject[styleName];
    }; // end getStyle()

    function setLabel(props) {
        // label content
        var labelAttribute = Math.round(props[expressed] * 10) / 10 + "%<b>  " + props.County + "</b>";

        var countyNameWithoutSpace = countyNameNoSpace(props.County);

        //create info label div
        var infolabel = d3.select(".nevadaMap")
            .append("div")
            .attr("class", "infolabel")
            .attr("id", countyNameWithoutSpace + "_label")
            .html(labelAttribute);

        var CountyName = infolabel.append("div")
            .attr("class", "labelname")
            .html(props.name);
    }; // end setLabel();

    function moveLabel() {
        // use coordinates of mousemove event to set label coordinates

        // get width of label
        var labelWidth = d3.select(".infolabel")
            .node()
            .getBoundingClientRect()
            .width;

        // use cooridanates of mousemove event to set label coordinates

        var x1 = event.clientX + 10,
            y1 = event.clientY - 75,
            x2 = event.clientX - labelWidth - 10,
            y2 = event.clientY + 25;

        // horizontal label coordinate, testing for overflow
        var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;

        // vertical label coordinate, testing for overflow
        var y = event.clientY < 75 ? y2 : y1;

        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
    }; // end moveLabel()

    // function to strip spaces from county names    
    function countyNameNoSpace(countyNameWithSpace) {
        var countyName = countyNameWithSpace.replace(/\s+/g, '');
        return countyName;
    } // end countyNameNoSpace()

function makeXaxis(csvData) {
        //create a second svg element to hold the bar chart
        var xAxis = d3.select(".chart")
            // .append("svg")
            // .attr("width", chartWidth)
            // .attr("height", 100)
            // .attr("class", "chartXaxis");
           
            var countyLabels = xAxis.selectAll(".countyLabel")
            .data(csvData)
            .enter()
            .append("text")
            .sort(function (a, b) {
                return b["Pop2022"] - a["Pop2022"]
            })
            .attr("class", "countyLabel")
            .attr("x", function (d, i) {
                var fraction = chartInnerWidth / csvData.length;
                return 25 + (i * fraction) + ((fraction - 1) / 2);
            })
            .attr("y", 383)
            .text(function (d) {
                return d["County"]
            });

} // end makeXaxis

})(); // end of wrapper function