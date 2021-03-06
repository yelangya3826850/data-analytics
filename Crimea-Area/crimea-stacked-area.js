var margin = {top: 20, right: 60, bottom: 30, left: 20},
    width = 680 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;    

function onRender() {

    var x = d3.time.scale()
    .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var z = d3.scale.ordinal()
        .range(["#E7E1EF", "#C994C7", "#DD1C77"]);
    
    d3.selectAll("svg")
       .remove(); 
    
    var svg = d3.select(".area-criema").append("svg")
        .attr("width", width+ margin.right + margin.left)
        .attr("height", height+ margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")");

    txt_value = document.getElementById('input_data').value;
    csv_txt = d3.csv.parse(txt_value);

    var parse = d3.time.format("%m/%Y").parse,
        format = d3.time.format("%b");
  
  // Transpose the data into layers by cause.
  var causes = d3.layout.stack()(["param1", "param2", "param3"].map(function(cause) {
    return csv_txt.map(function(d) {
      return {x: parse(d.date), y: +d[cause]};
    });
  }));

  // Compute the x-domain (by date) and y-domain (by top).
  x.domain([causes[0][0].x, causes[0][causes[0].length - 1].x]);
  y.domain([0, d3.max(causes[causes.length - 1], function(d) { return d.y0 + d.y; })]);
  max_total = d3.max(causes[causes.length - 1], function(d) { return d.y0 + d.y; });
  // Add an area for each cause.
  svg.selectAll("path.area")
      .data(causes)
    .enter().append("path")
      .attr("class", "area")
      .style("fill", function(d, i) { return z(i); })
      .attr("d", d3.svg.area()
      .x(function(d) { return x(d.x); })
      .y0(function(d) { return y(d.y0+max_total); })
      .y1(function(d) { return y(d.y0 + d.y+max_total); }));


  // Add a label per date.
  svg.selectAll("text")
      .data(x.ticks(12))
    .enter().append("text")
      .attr("x", x)
      .attr("y", 6 )
      .attr("text-anchor", "middle")
      .attr("dy", ".71em")
      .text(x.tickFormat(12));

  // Add y-axis rules.
  var rule = svg.selectAll("g.rule")
      .data(y.ticks(5))
    .enter().append("g")
      .attr("class", "rule")
      .attr("transform", function(d) { return "translate(0," + y(d+max_total) + ")"; });

  rule.append("line")
      .attr("x2", width)
      .style("stroke", function(d) { return d ? "#fff" : "#000"; })
      .style("stroke-opacity", function(d) { return d ? .7 : null; });

  rule.append("text")
      .attr("x", width + 6)
      .attr("dy", ".35em")
      .text(d3.format(",d"));
};