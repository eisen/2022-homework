
(() => {
  // Constants for the charts, that would be useful.
  const CHART_WIDTH = 500
  const CHART_HEIGHT = 250
  const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 }
  const ANIMATION_DURATION = 300

  const width = CHART_WIDTH - MARGIN.left - MARGIN.right
  const height = CHART_HEIGHT - MARGIN.top - MARGIN.bottom

  let dataset = 'covid_utah'
  let metric = 'deaths'
  let randomData = false

  const charts = [
    {
      id: '#Barchart-div',
      el: null,
      update: (el) => updateBarChart(el)
    },
    {
      id: '#Linechart-div',
      el: null,
      update: (el) => updateLineChart(el)
    },
    {
      id: '#Areachart-div',
      el: null,
      update: (el) => updateAreaChart(el)
    },
    {
      id: '#Scatterplot-div',
      el: null,
      update: (el) => updateScatterPlot(el)
    }
  ]

  const datasetChanged = (el) => {
    dataset = el.target.value
    changeData()
  }

  const metricChanged = (el) => {
    metric = el.target.value
    changeData()
  }

  const randomChanged = (el) => {
    randomData = el.target.checked
    changeData()
  }

  function setup() {

    // Fill in some d3 setting up here if you need
    // for example, svg for each chart, g for axis and shapes

    document.getElementById('dataset').onchange = datasetChanged
    document.getElementById('metric').onchange = metricChanged
    document.getElementById('random').onchange = randomChanged

    for (const chart of charts) {
      chart.el = d3.select(chart.id)
        .append('svg')
        .attr("width", width + MARGIN.left + MARGIN.right)
        .attr("height", height + MARGIN.top + MARGIN.bottom)
    }

    changeData()
  }

  /**
   * Render the visualizations
   * @param data
   */
  function update(data) {

    // ****** TODO ******
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, el => new Date(el.date)))
      .range([0, width - MARGIN.right])
      .nice()

    const maxY = d3.max(data, el => el[metric])

    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([height, 0]) // invert axis
      .nice()

    const xAxis = d3.axisBottom()
      .scale(xScale)
      .tickFormat(d3.timeFormat('%m/%d'))

    const yAxis = d3.axisLeft()
      .scale(yScale)

    // Syntax for line generator.
    // when updating the path for line chart, use the function as the input for 'd' attribute.
    // https://github.com/d3/d3-shape/blob/main/README.md


    // const lineGenerator = d3.line()
    //   .x(d => the x coordinate for a point of the line)
    //   .y(d => the y coordinate for a point of the line);

    // Syntax for area generator.
    // the area is bounded by upper and lower lines. So you can specify x0, x1, y0, y1 seperately. 
    // Here, since the area chart will have upper and lower sharing the x coordinates, we can just use x(). 
    // Similarly, use the function as the input for 'd' attribute. 

    // const areaGenerator = d3.area()
    //   .x(d => the x coordinates for upper and lower lines, both x0 and x1)
    //   .y1(d => the y coordinate for the upper line)
    //   .y0(d=> the base line y coordinate for the area);


    //Set up scatter plot x and y axis. 
    //Since we are mapping death and case, we need new scales instead of the ones above. 
    //Cases would be the horizontal axis, so we need to use width related constants.
    //Deaths would be vertical axis, so that would need to use height related constants.

    const maxX = d3.max(data, el => el.cases)

    const xScaleScatter = d3.scaleLinear()
      .domain([0, maxX])
      .range([0, width]) // invert axis
      .nice()

    const xAxisScatter = d3.axisBottom()
      .scale(xScaleScatter)

    //TODO 
    // call each update function below, adjust the input for the functions if you need to.
    charts.map(chart => {
      // Scatter plot uses a different horizontal axis
      if (chart.id === '#Scatterplot-div') {
        chart.xScale = xScaleScatter
        chart.xAxis = xAxisScatter
      } else {
        chart.xScale = xScale
        chart.xAxis = xAxis
      }

      // Clear old axis
      chart.el.selectAll('g').remove()

      // Add horizontal axis
      chart.el.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(${MARGIN.left}, ${height + MARGIN.top})`)
        .call(chart.xAxis)

      // Add vertical axis
      chart.yScale = yScale
      chart.yAxis = yAxis
      chart.el.append('g')
        .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
        .call(chart.yAxis)

      chart.data = data
      chart.update(chart)
    })
  }

  /**
   * Update the bar chart
   */

  function updateBarChart(chart) {
    const gap = 10
    const barW = ((width - MARGIN.right) / (chart.data.length - 1)) - gap

    // shift x-axis and remove line
    chart.el.select('.x-axis')
      .attr('transform', `translate(${MARGIN.left + (barW + gap) / 2}, ${height + MARGIN.top})`)
      .select('.domain')
      .remove()

    chart.el.append('g')
      .classed('bar-chart', true)
      .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
      .selectAll('rect')
      .data(chart.data, el => el[metric])
      .join('rect')
      .attr('x', (el, idx) => idx * (barW + gap) + gap / 2)
      .attr('width', (el, idx) => barW)
      .attr('y', height)
      .attr('height', 0)
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('y', el => height - chart.yScale(el[metric]))
      .attr('height', el => chart.yScale(el[metric]))
  }

  /**
   * Update the line chart
   */
  function updateLineChart(chart) {

  }

  /**
   * Update the area chart 
   */
  function updateAreaChart(chart) {

  }

  /**
   * update the scatter plot.
   */

  function updateScatterPlot(chart) {
    chart.el.append('g')
      .classed('scatter-plot', true)
      .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
      .selectAll('circle')
      .data(chart.data)
      .join('circle')
      .attr('cx', el => chart.xScale(el.cases) )
      .attr('cy', el => height - chart.yScale(el.deaths) )
      .attr('r', 0)
      .transition()
      .duration(ANIMATION_DURATION)
      .attr('r', 5)
  }


  /**
   * Update the data according to document settings
   */
  function changeData() {
    //  Load the file indicated by the select menu
    // const dataFile = d3.select('#dataset').property('value')

    d3.csv(`data/${dataset}.csv`)
      .then(dataOutput => {

        /**
         * D3 loads all CSV data as strings. While Javascript is pretty smart
         * about interpreting strings as numbers when you do things like
         * multiplication, it will still treat them as strings where it makes
         * sense (e.g. adding strings will concatenate them, not add the values
         * together, or comparing strings will do string comparison, not numeric
         * comparison).
         *
         * We need to explicitly convert values to numbers so that comparisons work
         * when we call d3.max()
         **/

        const dataResult = dataOutput.map((d) => ({
          cases: parseInt(d.cases),
          deaths: parseInt(d.deaths),
          date: d3.timeFormat("%m/%d")(d3.timeParse("%d-%b")(d.date))
        }))
        //if (document.getElementById('random').checked) {
        if (randomData) {
          // if random subset is selected
          update(randomSubset(dataResult))
        } else {
          update(dataResult)
        }
      }).catch(e => {
        console.log(e)
        alert('Error!')
      })
  }

  /**
   *  Slice out a random chunk of the provided in data
   *  @param data
   */
  function randomSubset(data) {
    return data.filter((d) => Math.random() > 0.5)
  }

  setup()
})()
