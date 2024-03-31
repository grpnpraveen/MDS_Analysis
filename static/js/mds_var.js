function mds_var_func(data, features) {

    document.getElementById("visualization").innerHTML = "";

    let margin = {top: 50, right: 50, bottom: 100, left: 500},
        width = 1200 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    let svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

        let x = d3.scaleLinear().domain([d3.min(data, (d, i) => data[i][0]) - 0.2, d3.max(data, (d, i) => data[i][0]) + 0.2]).range([0, width])
        let y = d3.scaleLinear().domain([d3.min(data, (d, i) => data[i][1]) - 0.05, d3.max(data, (d, i) => data[i][1]) + 0.05]).range([height, 0])
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

    g.append("text")
        .attr("y", -30)
        .attr("x", width / 2 + 100)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "25px")
        .text("Multidimensional Scaling Variables Plot");

    g.append("g")
        .attr("transform", "translate(100,0)");

    g.append("g")
        .attr("transform", "translate(100,0)")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "translate(-50,0) rotate(-90)")
        .attr("y", 0)
        .attr("x", -(height / 2))
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "18px")
        .text("Component_2")

    g.append("g")
        .attr("transform", "translate(900," + height + ") rotate(180)");

    for(let i = 0; i < features.length-3; i++) {
        g.append("text")
            .attr("transform", "translate(90,-5)")
            .attr("text-anchor", "end")
            .attr("fill", "grey")
            .attr("font-size", "8px")
            .attr("x", x(data[i][0]))
            .attr("y", y(data[i][1]))
            .text(features[i]);
    
        g.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .on("click", onClickSelectFeature)
            .attr("cx", (d, i) => x(data[i][0]))
            .attr("transform", "translate(100,0)")
            .transition()
            .delay((d, i) => (i))
            .duration(300)
            .attr("cy", (d, i) => y(data[i][1]))
            .attr("r", 8)
            // .style("fill", "skyblue")
            .style("fill", function(d,i)
            {
                if(selected_dots.includes(i))
                {
                    return "orange";
                }
                return "skyblue";
            })

         
    }



    function onClickSelectFeature(d, i) {
        // console.log(i);
        if(selected_Features.includes(features[i]))
        {
            d3.select(this).style("fill", "skyblue")
            selected_Features=selected_Features.filter(item => item !== features[i])
            selected_dots=selected_dots.filter(item=>item !== i)
        }
        else{
            d3.select(this).style("fill", "orange")
            selected_Features.push(features[i])
            selected_dots.push(i);
            
        }
    }
}
