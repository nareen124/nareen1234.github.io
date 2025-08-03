const width = 800, height = 400;
const margin = { top: 40, right: 100, bottom: 50, left: 70 };

// Clear chart area or create if missing
function clearChart() {
  let chart = d3.select("#chart");
  if (chart.empty()) d3.select("body").append("div").attr("id", "chart");
  else chart.html("");
}

function drawLineChart(data, country) {
  clearChart();

  const svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // x scale: years (numeric)
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => +d.Year))
    .range([0, innerWidth]);

  // y scale: emissions
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.Emissions)])
    .range([innerHeight, 0]);

  // Line generator
  const line = d3.line()
    .x(d => x(+d.Year))
    .y(d => y(+d.Emissions));

  // Draw axes
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // format year as integer

  g.append("g")
    .call(d3.axisLeft(y));

  // Draw line path
  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text(`CO₂ Emissions Per Capita Over Time: ${country}`);

  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Year");

  svg.append("text")
    .attr("transform", `translate(15, ${height/2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text("Emissions (MtCO₂ per capita)");
}

// Load CSV and draw for a single country
d3.select("#btn-emissions").on("click", () => {
  d3.csv("data/co-emissions-per-capita.csv").then(rawData => {
    const emissionField = "Annual CO emissions (per capita)";

    // Filter for one country, e.g. Afghanistan
    const country = "Afghanistan";
    const filtered = rawData
      .filter(d => d.Entity === country)
      .map(d => ({
        Year: +d.Year,
        Emissions: +d[emissionField]
      }));

    drawLineChart(filtered, country);
  }).catch(err => {
    console.error("Failed to load data:", err);
    d3.select("#chart").html("Failed to load emissions data.");
  });
});
