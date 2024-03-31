
function pcp_plt_func(cluster) {

    document.getElementById("visualization").innerHTML = "";

    let condition_text = []
    let wind_direction = []
    let moon_phase = []

    let margin = {top: 80, right: 50, bottom: 60, left: 50},
    
        width = 1200 - margin.left - margin.right,
        height = 750 - margin.top - margin.bottom;

    let x = d3.scalePoint().range([0, width], 1),
        y = {}

    let sliding = {},
        selectedlines;
        line = d3.line(),
        axis = d3.axisLeft()
    
    let svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(50," + margin.top + ")");

    svg.append("text")
        .attr("y", -40)
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-family", "Optima, sans-serif")
        .attr("font-size", "25px")
        .text("Parallel Co-ordinates Plot");

        let legendColors = cluster_colors.slice(0,current_k+1);
        let legendLabels = Array.from(new Set(cluster)).map((d, i) => "C" + (i + 1));
    
        // Create legend container
        let legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (width + 20) + "," + 12 + ")");
    
        // Append legend elements
        let legendRects = legend.selectAll(".legend-rect")
            .data(legendColors)
            .enter().append("rect")
            .attr("class", "legend-rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => d);
    
        let legendText = legend.selectAll(".legend-text")
            .data(legendLabels)
            .enter().append("text")
            .attr("class", "legend-text")
            .attr("x", 15)
            .attr("y", (d, i) => i * 20 + 9)
            .text(d => d)
            .attr("alignment-baseline", "middle")
            .attr("fill", "white")
            .style("font-size", "12px");


    d3.csv("static/data/data.csv", function (error, data) {

        data.map((d) => condition_text.push(d['condition_text']));
        data.map((d) => wind_direction.push(d['wind_direction']));
        data.map((d) => moon_phase.push(d['moon_phase']));

        x.domain(dimensions = d3.keys(data[0]).filter(function (d) {
            if (d === "wind_direction") {
                return (y[d] = d3.scaleBand().domain(wind_direction).range([height, 0]));
            }
            else if (d === "moon_phase")
            {
                return (y[d] = d3.scaleBand().domain(moon_phase).range([height, 0]));
                
            }
            else if (d === "condition_text")
            {
                return (y[d] = d3.scaleBand().domain(condition_text).range([height, 0]));

            }
            else {
                return (y[d] = d3.scaleLinear()
                    .domain(d3.extent(data, function (p) {
                        return +p[d];
                    }))
                    .range([height, 0]));
            }
        }));

        let unselectedlines = svg.append("g")
            .attr("class", "unselectedlines")
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("d", path)

        selectedlines = svg.append("g")
            .attr("class", "selectedlines")
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", function (d, i) {

                return cluster_colors[cluster[i]];
            })

        let g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter()
            .append("g")
            .attr("class", "dimension")
            .attr("transform", function (d) {
                return "translate(" + x(d) + ")";
            })
            .call(d3.drag()
                .on("start", function (d) {
                    sliding[d] = x(d);
                    unselectedlines.attr("visibility", "hidden");
                })
                .on("drag", function (d) {
                    sliding[d] = Math.min(width, Math.max(0, d3.event.x));
                    selectedlines.attr("d", path);
                    dimensions.sort(function (a, b) {
                        return pos_at(a) - pos_at(b);
                    });
                    x.domain(dimensions);
                    g.attr("transform", function (d) {
                        return "translate(" + pos_at(d) + ")";
                    })
                })
                .on("end", function (d) {
                    delete sliding[d];
                    d3.select(this).transition().duration(500).attr("transform", "translate(" + x(d) + ")");
                    selectedlines.transition().duration(500).attr("d", path);
                    unselectedlines
                        .attr("d", path)
                        .transition()
                        .delay(500)
                        .duration(0)
                        .attr("visibility", null);
                }));

        g.append("g")
            .attr("class", "axis")
            .each(function (d) {
                d3.select(this).call(axis.scale(y[d]));
            })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function (d) {
                return d;
            })
            .attr("fill","white")
            .style("font-size", "10px"); // Adjust font size here

        g.append("g")
            .attr("class", "brush")
            .each(function (d) {
                d3.select(this).call(y[d].brush = d3.brushY().extent([[-7, 0], [7, height]]).on("start", brush_start).on("brush", brush).on("end", brush))
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    });

    function pos_at(d) {
        return sliding[d] == null ? x(d) : sliding[d];
    }

    function path(d) {
        return line(dimensions.map(function (p) {
            if (p === "wind_direction" || p === "condition_text" || p === "moon_phase")
                return [pos_at(p), y[p](d[p]) + y[p].bandwidth() / 2];
            else
                return [pos_at(p), y[p](d[p])];
        }));
    }

    function brush_start() {
        d3.event.sourceEvent.stopPropagation();
    }

    function brush() {
        let current_active = [];
        svg.selectAll(".brush")
            .filter(function (d) {
                return d3.brushSelection(this);
            })
            .each(function (key) {
                current_active.push({
                    dimension: key,
                    extent: d3.brushSelection(this)
                });
            });

        if (current_active.length === 0) {
            selectedlines.style("display", null);
        } 
        else {
            selectedlines.style("display", function (d) {
                return current_active.every(function (brushing) {
                    if (brushing.dimension === "wind_direction") {
                        return brushing.extent[0] <= y[brushing.dimension](d[brushing.dimension]) + y[brushing.dimension].bandwidth() / 2 &&
                            (y[brushing.dimension](d[brushing.dimension]) + y[brushing.dimension].bandwidth() / 2) <= brushing.extent[1];
                    } else {
                        return brushing.extent[0] <= y[brushing.dimension](d[brushing.dimension]) &&
                            y[brushing.dimension](d[brushing.dimension]) <= brushing.extent[1];
                    }
                }) ? null : "none";
            });
        }
    }
}