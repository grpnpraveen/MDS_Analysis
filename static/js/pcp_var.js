
function pcp_selec_vars(selected_Features, cluster) {

    // console.log(selected_Features);
    if (selected_Features.length === 0) {
        alert("select variables from MDS variables plot")
        return
    }

    document.getElementById("visualization").innerHTML = "";

    let margin = {top: 100, right: 50, bottom: 50, left: 50},
        width = 950 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    let x = d3.scalePoint().range([0, width], 1),
        y = {}

    let line = d3.line(),
        axis = d3.axisLeft(),
        sliding = {},
        selectedlines;

    let svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right + 300)
        .attr("height", height + margin.top + margin.bottom + 300)
        .append("g")
        .attr("transform", "translate(50," + margin.top + ")");

        svg.append("text")
        .attr("y", -40)
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-family", "Optima, sans-serif")
        .attr("font-size", "25px")
        .text("Parallel Co-ordinates Variables Plot");
        let legendLabels = Array.from(new Set(cluster)).map((d, i) => "C" + (i + 1));
        let legendColors = cluster_colors.slice(0,current_k+1);
    
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
            .attr("y", (d, i) => i * 20 + 8)
            .text(d => d)
            .attr("alignment-baseline", "middle")
            .attr("fill", "white")
            .style("font-size", "12px");

    d3.csv("static/data/data.csv", function (error, data) {

        x.domain(dimensions = selected_Features.filter(function (d) {
            return (y[d] = d3.scaleLinear()
                .domain(d3.extent(data, function (te) {
                    return +te[d];
                }))
                .range([height, 0]));
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
                        return position(a) - position(b);
                    });
                    x.domain(dimensions);
                    g.attr("transform", function (d) {
                        return "translate(" + position(d) + ")";
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
            .attr("fill", "white")

        g.append("g")
            .attr("class", "brush")
            .each(function (d) {
                d3.select(this).call(y[d].brush = d3.brushY().extent([[-10, 0], [10, height]]).on("start", brushstart).on("brush", brush).on("end", brush))
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);
    });

    function position(d) {
        return sliding[d] == null ? x(d) : sliding[d];
    }

    function path(d) {
        return line(dimensions.map(function (p) {
            return [position(p), y[p](d[p])];
        }));
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    function brush() {
        let current_actives = [];
        svg.selectAll(".brush")
            .filter(function (d) {
                return d3.brushSelection(this);
            })
            .each(function (key) {
                current_actives.push({
                    dimension: key,
                    extent: d3.brushSelection(this)
                });
            });

        if (current_actives.length === 0) {
            selectedlines.style("display", null);
        } 
        else {
            selectedlines.style("display", function (d) {
                return current_actives.every(function (brushing) {
                    return brushing.extent[0] <= y[brushing.dimension](d[brushing.dimension]) &&
                        y[brushing.dimension](d[brushing.dimension]) <= brushing.extent[1];
                }) ? null : "none";
            });
        }
    }
}
