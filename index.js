const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  colors = [
    "#024ec9",
    "#275eb8",
    "#517abd",
    "#7f94b8",
    "#c7c679",
    "#d19d43",
    "#b37e22",
    "#b87707",
    "#bd5d26",
    "#ed5802",
    "#e83c15",
    "#e03641",
    "#e01624",
    "#ff0000",
  ];
function Heatmap() {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    async function getData() {
      const response = await fetch(
        "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
      );
      const json = await response.json();
      setData(json);
    }
    getData();
  }, []);

  return (
    <div className="container">
      <h1 id="title">Monthly Global Land-Surface Temperature</h1>
      <h2 id="description">
        {data.monthlyVariance
          ? `${data.monthlyVariance[0].year} - ${
              data.monthlyVariance[data.monthlyVariance.length - 1].year
            }: Base Temperature ${data.baseTemperature}℃`
          : null}
      </h2>
      <div id="svg-div">
        <Chart data={data} />
      </div>
    </div>
  );
}

function Chart({ data }) {
  const height = 400,
    width = 1000;

  React.useEffect(() => {
    if (data && data.baseTemperature) return createMap();
  }, [data]);

  const createMap = () => {
    const svg = d3.select("svg");

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

    // create legend
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${width / 7}, ${height + 20})`);

    legend
      .selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .attr("x", (_d, i) => i * 50)
      .attr("y", 5)
      .attr("width", 50)
      .attr("height", 25)
      .attr("fill", (d) => d);

    legend
      .selectAll("text")
      .data(colors)
      .enter()
      .append("text")
      .attr("x", (_d, i) => i * 50)
      .attr("y", 50)
      .text((_d, i) => `~${i}℃`)
      .attr("fill", (d) => d);

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(data.monthlyVariance, (d) => {
          const date = new Date(0);
          date.setUTCFullYear(d.year);
          date.setUTCMonth(d.month - 1);
          return date;
        }),
        d3.max(data.monthlyVariance, (d) => {
          const date = new Date(0);
          date.setUTCFullYear(d.year);
          date.setUTCMonth(d.month - 1);
          return date;
        }),
      ])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([1, 12])
      .range([0, height - 35]);

    const xAxis = d3.axisBottom(xScale).tickFormat((d) => d.getFullYear());
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(12)
      .tickFormat((a) => monthNames[a - 1]);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg.append("g").attr("id", "y-axis").call(yAxis);

    const cellWidth = 3;
    const cellHeight = 35;

    svg
      .selectAll("rect")
      .data(data.monthlyVariance)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => d.variance)
      .attr("x", (d) => {
        const date = new Date(0);
        date.setUTCFullYear(d.year);
        date.setUTCMonth(d.month - 1);
        return xScale(date);
      })
      .attr("y", (d) => yScale(d.month))
      .attr("width", cellWidth)
      .attr("height", cellHeight)
      .attr(
        "fill",
        (d) => colors[parseInt(data.baseTemperature) + parseInt(d.variance)]
      )
      .on("mouseover", (e, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip
          .html(
            `${monthNames[d.month - 1]} ${d.year}: ${
              parseFloat(data.baseTemperature) + parseFloat(d.variance)
            } (${d.variance})℃`
          )
          .attr("data-year", d.year)
          .style("left", `${e.pageX + 10}px`)
          .style("top", `${e.pageY - 10}px`);
      })
      .on("mouseout", (_d) => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  };

  return <svg width={width} height={height}></svg>;
}

ReactDOM.render(<Heatmap />, document.getElementById("root"));
