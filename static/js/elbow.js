function show_elbowplot() {

    document.getElementById("visualization").innerHTML = "";
    var binsArray = {};
    var i = 1
    for (const value of elbowXvalues) {
        binsArray["C" + i] = elbowYvalues[i - 1];
        i = i + 1
    }
    
    var BINS = Object.keys(binsArray);


    var SVG = d3.select("svg").attr("width", 900).attr("height", 600),
        margin = 250,
        width = SVG.attr("width") - margin,
        height = SVG.attr("height") - margin;

    var x = d3.scaleBand().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var g = SVG
        .append("g")
        .attr("transform", "translate(" + 150 + "," + 100 + ")");

    x.domain(BINS);
    y.domain([
        d3.min(elbowYvalues) - 0.1, d3.max(elbowYvalues) + 0.1
    ]);
g.selectAll(".bar")
.data(BINS)
.enter()
.append("rect")
.attr("class", "bar")
.attr("x", function(d) { return x(d)+118; })
.attr("y", function(d) { return y(binsArray[d]); })
.attr("width", 30)
.attr("height", function(d) { return height - y(binsArray[d]); })
.attr("fill", "steelblue")
.on("click", function (d,i) {

    if_clicked(i);
});

bars_selected2 = d3.selectAll(".bar")._groups[0]

    g.append("g")
        .attr("transform", "translate(100," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "0")
        .attr("text-anchor", "middle")
        .attr("fill", "white"); // Change tick color to white;;


    g.append("g")
        .call(d3.axisLeft(y))
        .call(d3.axisLeft(y).tickFormat(d => d).ticks(8))
        .attr("transform", "translate(100,0)")
        .selectAll("text")
        .attr("fill", "white"); // Change tick color to white;




    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 80)
        .attr("fill", "white")
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("No of Clusters(k)");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 150)
        .attr("x", -200)
        .attr("dy", "-5.1em")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .text("MSE");

    g.append("text")
        .attr("x", width / 2 - 15)
        .attr("y", 5)
        .attr("fill", "white")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .text("Elbow Plot of k");


    g.selectAll(".dotScreePlot")
        .data(BINS)
        .enter()
        .append("circle")
        .attr("transform", "translate(100,0)")
        .attr("class", "dotScreePlot")
        .attr("r", 10)
        .attr("stroke", "black")
        .attr("fill", function (d, i) {
            if (i == current_k) {
                return "red";
            } else {
                return "black";
            }
        })
        .attr("cx", function (d) {
            return x(d) + x.bandwidth() / 2
        })
        .attr("cy", function (d, i) {
            return y(binsArray[d])
        }).on("click", function (d,i) {
            if_clicked(i);
        })

    var d = [];
    for (var i = 0; i < BINS.length; i++) {
        d.push(i);
    }

    g.append("path")
        .attr("transform", "translate(100,0)")
        .datum(d)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d, i) {
                return x(BINS[i]) + x.bandwidth() / 2
            })
            .y(function (d, i) {
                return y(elbowYvalues[i])
            })
        )
        scree_circles = d3.selectAll(".dotScreePlot")._groups[0]
      
        bars_selected2[current_k].setAttribute("fill","orange");
}


function if_clicked(i)
{
    for (let j = 0; j <= 9; j++) {
        scree_circles[j].setAttribute("fill","black");
        bars_selected2[j].setAttribute("fill","steelblue");
    }
    current_k=i
    scree_circles[i].setAttribute("fill","red");
    bars_selected2[current_k].setAttribute("fill","orange");

    $.ajax({
        type: "GET",
        url: '/k/'+(current_k+1).toString(),
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
        success: function (datas) {
            pcp_cluster_vals = datas["pcp_cluster"]
            mds_cluster = datas["mds_cluster"]
        }
    });
}