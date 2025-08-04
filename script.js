const width = 800, height = 400;
const margin = { top: 40, right: 100, bottom: 50, left: 70 };

function clearChart() {
  d3.select("#chart").html("");
}

function drawLineChart(data, country) {
  clearChart();

  const svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", 550);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => +d.Year))
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.Emissions)])
    .range([innerHeight, 0]);

  const line = d3.line()
    .x(d => x(+d.Year))
    .y(d => y(+d.Emissions));

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  g.append("g")
    .call(d3.axisLeft(y));

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text(`CO₂ Emissions Per Capita Over Time: ${country}`);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Year");

  svg.append("text")
    .attr("transform", `translate(15, ${height / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text("Emissions (MtCO₂ per capita)");
}


d3.select("#btn-emissions").on("click", () => {
  d3.csv("data/co-emissions-per-capita.csv").then(rawData => {
    const emissionField = "Annual CO emissions (per capita)";
    
    rawData.forEach(d => {
      d.Year = +d.Year;
      d.Emissions = +d[emissionField];
    });

    const countries = Array.from(new Set(rawData.map(d => d.Entity))).sort();

    let container = d3.select("#dropdown-container");
    if (container.empty()) {
      container = d3.select("body").append("div").attr("id", "dropdown-container");
    }
    container.html(""); 

    const select = container.append("select").attr("id", "country-select");
    select.append("option").attr("value", "").text("Select a country");

    countries.forEach(c => {
      select.append("option").attr("value", c).text(c);
    });

    select.on("change", function() {
      const selectedCountry = this.value;
      if (!selectedCountry) {
        clearChart();
        return;
      }

      const filtered = rawData.filter(d => d.Entity === selectedCountry && !isNaN(d.Emissions));

      drawLineChart(filtered, selectedCountry);
    });
  }).catch(err => {
    console.error("Failed to load data:", err);
    d3.select("#chart").html("Failed to load emissions data.");
  });
});


d3.select("#btn-primary-source").on("click", () => {
    d3.csv("data/global-energy-substitution.csv").then(data => {
      data.forEach(d => {
        d.Year = +d.Year;
        for (let key in d) {
          if (key.includes("TWh")) {
            d[key] = +d[key];
          }
        }
      });
  
      drawPrimaryEnergyChart(data);

    }).catch(err => {
      console.error("Failed to load energy data:", err);
      d3.select("#chart2").html("Failed to load energy data.");
    });
  });

  function drawPrimaryEnergyChart(data) {
    clearChart();
  
    const svg = d3.select("#chart2").append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const keys = [
      "Other renewables (TWh, substituted energy)",
      "Biofuels (TWh, substituted energy)",
      "Solar (TWh, substituted energy)",
      "Wind (TWh, substituted energy)",
      "Hydropower (TWh, substituted energy)",
      "Nuclear (TWh, substituted energy)",
      "Gas (TWh, substituted energy)",
      "Oil (TWh, substituted energy)",
      "Coal (TWh, substituted energy)",
      "Traditional biomass (TWh, substituted energy)"
    ];
  
    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(d3.schemeCategory10);
  
    const stackedData = d3.stack().keys(keys)(data);
  
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Year))
      .range([0, innerWidth]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => keys.reduce((sum, key) => sum + (d[key] || 0), 0))])
      .nice()
      .range([innerHeight, 0]);
  
    const area = d3.area()
      .x(d => x(d.data.Year))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));
  
    const layer = g.selectAll(".layer")
      .data(stackedData)
      .enter().append("path")
      .attr("class", "layer")
      .attr("d", area)
      .style("fill", d => color(d.key))
      .style("stroke", "white")
      .style("stroke-width", 0.5);
  
    // x-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  
    g.append("g")
      .call(d3.axisLeft(y));
  
    // chart 
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text(`Primary Energy Consumption by Source`);
  
    // y-axis
    svg.append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Energy consumption (TWh)");
  

      const legendX = margin.left + innerWidth + 20;  
      const legendY = margin.top;                    
      
      const legend = svg.append("g")
        .attr("transform", `translate(${legendX}, ${legendY})`);
      
      keys.forEach((key, i) => {
        const legendGroup = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`);  
      
        legendGroup.append("rect")
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", color(key));
      
        legendGroup.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .attr("font-size", "12px")
          .text(key.replace(" (TWh, substituted energy)", ""));
      });
      
  
    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.75)")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);
  
    svg.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", function(event) {
        const [mx] = d3.pointer(event);
        const year = Math.round(x.invert(mx - margin.left));
  
        const yearData = data.find(d => d.Year === year);
        if (!yearData) return;
  
        let html = `<strong>Year:</strong> ${year}<br>`;
        keys.forEach(k => {
          const val = yearData[k] || 0;
          html += `${k.replace(" (TWh, substituted energy)", "")}: <strong>${val.toLocaleString()} TWh</strong><br>`;
        });
  
        tooltip.html(html)
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 30}px`)
          .transition().duration(100).style("opacity", 1);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });
  }
  