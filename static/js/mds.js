
function mds_data_func(data, cluster) {

    document.getElementById("visualization").innerHTML = "";

    let margin = {top: 50, right: 50, bottom: 100, left: 500},
        width = 1200 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    let svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    let x = d3.scaleLinear().domain([d3.min(data, (d, i) => data[i][0]), d3.max(data, (d, i) => data[i][0])]).range([0, width])
    let y = d3.scaleLinear().domain([d3.min(data, (d, i) => data[i][1]), d3.max(data, (d, i) => data[i][1])]).range([height, 0])

    let g = svg.append("g")
        .attr("transform", "translate(100,80)");

    g.append("g")
        .attr("transform", "translate(100," + height + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("y", 50)
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "18px")
        .text("Component_1")

    g.append("g")
        .attr("transform", "translate(100,0)");

    g.append("g")
        .attr("transform", "translate(100,0)")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "translate(40,0) rotate(-90)")
        .attr("y", 0)
        .attr("x", -(height / 2))
        .attr("dy", "-5.1em")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "18px")
        .text("Component_2")

    g.append("text")
        .attr("y", -30)
        .attr("x", width / 2 + 100)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "25px")
        .text("Multidimensional Scaling Plot Using Euclidean Distances");

    g.append("g")
        .attr("transform", "translate(900," + height + ") rotate(180)");

    g.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => x(data[i][0]))
        .attr("transform", "translate(100,0)")
        .attr("cy", (d, i) => y(data[i][1]))
        .transition()
        .delay((d, i) => (i * 1))
        .duration(250)
        .attr("r", 3)
        .style("fill", function (d, i) {
           return  cluster_colors[cluster[i]]
        })
        for(let i = 0; i < current_k+1; i++) {
            g.append("rect")
                .attr("x", width + 120)
                .attr("y", 10 + 20 * i)
                .attr("width", 14) // Adjust width as needed
                .attr("height", 14) // Adjust height as needed
                .attr("fill", cluster_colors[i]);
        
            g.append("text")
                .attr("y", 22 + 20 * i) // Adjust y position for text alignment
                .attr("x", width + 140) // Adjust x position for text alignment
                .attr("text-anchor", "start")
                .attr("fill", "white")
                .attr("font-size", "12px")
                .text("C" + (i + 1).toString());
        }
        

}
