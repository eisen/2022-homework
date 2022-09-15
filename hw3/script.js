
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

  const xAxis = d3.axisBottom()
    .tickFormat(d3.timeFormat('%m/%d'))

  const yAxis = d3.axisLeft()

  const xAxisScatter = d3.axisBottom()

  const yAxisScatter = d3.axisLeft()

  const charts = [
    {
      id: '#Barchart-div',
      update: (el) => updateBarChart(el)
    },
    {
      id: '#Linechart-div',
      update: (el) => updateLineChart(el)
    },
    {
      id: '#Areachart-div',
      update: (el) => updateAreaChart(el)
    },
    {
      id: '#Scatterplot-div',
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

  const SVGvalue = svg => svg.baseVal.valueAsString

  function setup() {

    // Fill in some d3 setting up here if you need
    // for example, svg for each chart, g for axis and shapes

    d3.select('#dataset').on('change', datasetChanged)
    d3.select('#metric').on('change', metricChanged)
    d3.select('#random').on('change', randomChanged)

    for (const chart of charts) {
      chart.el = d3.select(chart.id)
        .append('svg')
        .attr("width", width + MARGIN.left + MARGIN.right)
        .attr("height", height + MARGIN.top + MARGIN.bottom)

      // Add horizontal axis
      chart.el.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(${MARGIN.left}, ${height + MARGIN.top})`)

      // Add vertical axis
      chart.el.append('g')
        .classed('y-axis', true)
        .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)

      chart.el.append('g')
        .classed('content', true)
        .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
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

    xAxis.scale(xScale)

    const maxY = d3.max(data, el => el[metric])

    const yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([height, 0]) // invert axis
      .nice()

    yAxis.scale(yScale)

    //Set up scatter plot x and y axis. 
    //Since we are mapping death and case, we need new scales instead of the ones above. 
    //Cases would be the horizontal axis, so we need to use width related constants.
    //Deaths would be vertical axis, so that would need to use height related constants.

    const maxX = d3.max(data, el => el.cases)
    const maxYScatter = d3.max(data, el => el.deaths)

    const xScaleScatter = d3.scaleLinear()
      .domain([0, maxX])
      .range([0, width])
      .nice()

    xAxisScatter.scale(xScaleScatter)

    const yScaleScatter = d3.scaleLinear()
      .domain([0, maxYScatter])
      .range([height, 0]) // invert axis
      .nice()

    yAxisScatter.scale(yScaleScatter)

    //TODO 
    // call each update function below, adjust the input for the functions if you need to.
    charts.map(chart => {
      // Scatter plot uses a different horizontal axis
      if (chart.id === '#Scatterplot-div') {
        chart.xScale = xScaleScatter
        chart.xAxis = xAxisScatter

        chart.yScale = yScaleScatter
        chart.yAxis = yAxisScatter
      } else {
        chart.xScale = xScale
        chart.xAxis = xAxis

        chart.yScale = yScale
        chart.yAxis = yAxis
      }

      // Update horizontal axis
      chart.el.select('.x-axis')
        .transition()
        .call(chart.xAxis)

      // Update vertical axis
      chart.el.select('.y-axis')
        .transition()
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
    const barW = ((width - MARGIN.right) / (chart.xScale.ticks().length - 1))

    // shift x-axis and remove line
    chart.el.select('.x-axis')
      .attr('transform', `translate(${MARGIN.left + (barW + gap) / 2}, ${height + MARGIN.top})`)
      .select('.domain')
      .remove()

    const content = chart.el.select('.content')
      .classed('bar-chart', true)

    content.selectAll('rect')
      .data(chart.data, el => el[metric])
      .join(
        (enter) => {
          return enter.append('rect')
            .on('mouseover', el => d3.select(el.target).classed('hovered', true))
            .on('mouseout', el => d3.select(el.target).classed('hovered', false))
            .attr('x', (el, idx) => gap + chart.xScale(new Date(el.date)))
            .attr('width', (el, idx) => barW - gap)
            .attr('y', height)
            .attr('height', 0)
            .transition()
            .duration(ANIMATION_DURATION)
            .attr('y', el => height - chart.yScale(el[metric]))
            .attr('height', el => chart.yScale(el[metric]))
        },
        (update) => {
          return update.transition()
            .duration(ANIMATION_DURATION)
            .attr('y', el => height - chart.yScale(el[metric]))
            .attr('height', el => chart.yScale(el[metric]))
        },
        (exit) => {
          return exit.transition()
            .duration(ANIMATION_DURATION)
            .attr('y', height)
            .attr('height', 0)
            .remove()
        })
  }

  /**
   * Update the line chart
   */
  function updateLineChart(chart) {
    const content = chart.el.select('.content')

    // Syntax for line generator.
    // when updating the path for line chart, use the function as the input for 'd' attribute.
    // https://github.com/d3/d3-shape/blob/main/README.md


    // const lineGenerator = d3.line()
    //   .x(d => the x coordinate for a point of the line)
    //   .y(d => the y coordinate for a point of the line)

    const lineGen = d3.line()
      .x(el => chart.xScale(new Date(el.date)))
      .y(el => chart.yScale(el[metric]))

    content.selectAll('path')
      .data([chart.data[0]]) // create a one object array to activate the join
      .join(
        (enter) => {
          return enter.append('path')
            .classed('line-chart', true)
            .datum(chart.data)
            .attr('d', lineGen)
            .attr('opacity', 0)
            .transition()
            .duration(ANIMATION_DURATION)
            .attr('opacity', 1)
        },
        (update) => {
          return update.datum(chart.data)
            .transition()
            .duration(ANIMATION_DURATION)
            .attr('d', lineGen)
        },
        (exit) => {
          return exit.transition()
            .duration(ANIMATION_DURATION)
            .attr('opacity', 0)
            .remove()
        }
      )
  }

  /**
   * Update the area chart 
   */
  function updateAreaChart(chart) {
    const content = chart.el.select('.content')

    // Syntax for area generator.
    // the area is bounded by upper and lower lines. So you can specify x0, x1, y0, y1 separately. 
    // Here, since the area chart will have upper and lower sharing the x coordinates, we can just use x(). 
    // Similarly, use the function as the input for 'd' attribute. 

    // const areaGenerator = d3.area()
    //   .x(d => the x coordinates for upper and lower lines, both x0 and x1)
    //   .y1(d => the y coordinate for the upper line)
    //   .y0(d=> the base line y coordinate for the area)

    const areaGenStart = d3.area()
      .x(el => chart.xScale(new Date(el.date)))
      .y1(el => chart.yScale(0))
      .y0(el => chart.yScale(0))

    const areaGenEnd = d3.area()
      .x(el => chart.xScale(new Date(el.date)))
      .y1(el => chart.yScale(el[metric]))
      .y0(el => chart.yScale(0))

    content.selectAll('path')
      .data([chart.data[0]]) // create a one object array to activate the join
      .join(
        (enter) => {
          return enter.append('path')
            .classed('area-chart', true)
            .datum(chart.data)
            .attr('d', areaGenStart)
            .transition()
            .duration(ANIMATION_DURATION)
            .attr('d', areaGenEnd)
        },
        (update) => {
          return update.datum(chart.data)
            .transition()
            .duration(ANIMATION_DURATION)
            .attr('d', areaGenEnd)
        },
        (exit) => {
          return exit.transition()
            .duration(ANIMATION_DURATION)
            .remove()
        })
  }

  /**
   * update the scatter plot.
   */

  function updateScatterPlot(chart) {
    const content = chart.el.select('.content')
      .classed('scatter-plot', true)

    content.selectAll('circle')
      .data(chart.data)
      .join(
        (enter) => {
          return enter.append('circle')
            .on('click', el => console.log(`x: ${SVGvalue(el.target.cx)}, y: ${SVGvalue(el.target.cy)}`))
            .on('mouseover', el => d3.select(el.target).classed('hovered', true))
            .on('mouseout', el => d3.select(el.target).classed('hovered', false))
            .attr('cx', el => chart.xScale(el.cases))
            .attr('cy', el => height - chart.yScale(el.deaths))
            .attr('r', 0)
            .transition()
            .duration(ANIMATION_DURATION)
            .attr('r', 7)
        },
        (update) => {
          return update.transition()
            .attr('cx', el => chart.xScale(el.cases))
            .attr('cy', el => height - chart.yScale(el.deaths))
        },
        (exit) => {
          return exit.transition()
            .duration(ANIMATION_DURATION)
            .attr('r', 0)
            .remove()
        })
  }


  /**
   * Update the data according to document settings
   */
  function changeData() {
    //  Load the file indicated by the select menu
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
