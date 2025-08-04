const width = 800, height = 400;
const margin = { top: 40, right: 100, bottom: 50, left: 70 };

function clearChart() {
  d3.select("#chart").html("");
}

function drawLineChart(data, country) {
  clearChart();

  const svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

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

// When clicking button, load CSV and populate dropdown + chart
d3.select("#btn-emissions").on("click", () => {
  d3.csv("data/co-emissions-per-capita.csv").then(rawData => {
    const emissionField = "Annual CO emissions (per capita)";
    
    // Process data: parse year and emissions as numbers
    rawData.forEach(d => {
      d.Year = +d.Year;
      d.Emissions = +d[emissionField];
    });

    // Get unique countries/entities
    const countries = Array.from(new Set(rawData.map(d => d.Entity))).sort();

    // Create or select the dropdown container
    let container = d3.select("#dropdown-container");
    if (container.empty()) {
      container = d3.select("body").append("div").attr("id", "dropdown-container");
    }
    container.html(""); // clear previous dropdown if any

    // Create dropdown select
    const select = container.append("select").attr("id", "country-select");
    select.append("option").attr("value", "").text("Select a country");

    countries.forEach(c => {
      select.append("option").attr("value", c).text(c);
    });

    // When a country is selected, filter and draw chart
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
