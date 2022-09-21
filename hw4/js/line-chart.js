/** Class representing the line chart view. */
class LineChart {

  continents = null
  chartSVG = null

  width = 700
  height = 500

  left = 80
  top = 10
  bottom = 50

  startDate = 0
  endDate = 0

  xAxis = d3.axisBottom()
    .tickFormat(d3.timeFormat('%b %G'))

  xScale = null

  yAxis = d3.axisLeft()
  yScale = null

  animationDuration = 300

  /**
   * Creates a LineChart
   * @param globalApplicationState The shared global application state (has the data and map instance in it)
   */
  constructor(globalApplicationState) {
    // Set some class level variables
    this.globalApplicationState = globalApplicationState

    this.continents = d3.group(globalApplicationState.covidData.filter(this.GetContinentData), el => el.location)

    this.chartSVG = d3.select('#line-chart')

    this.SetupAxes()
    this.updateSelectedCountries()
  }

  GreatestValue = (group) => {
    let greatestValue = d3.greatest(group, ([cases, value]) => {
      const greatest = d3.greatest(d3.group(value, el => el.total_cases_per_million), ([icases,]) => {
        return parseFloat(icases)
      })
      return parseFloat(greatest[0])
    })

    return parseFloat(greatestValue[1].reduce((prev, next) => {
      return parseFloat(prev.total_cases_per_million) > parseFloat(next.total_cases_per_million) ? prev : next
    }, greatestValue[0]).total_cases_per_million)
  }

  EarliestDate = (group) => {
    let earliestDate = d3.least(group, ([date, value]) => {
      const least = d3.least(d3.group(value, el => el.date), ([idate,]) => {
        return new Date(idate).valueOf()
      })
      return new Date(least[0]).valueOf()
    })

    return new Date(earliestDate[1].reduce((prev, next) => {
      return new Date(prev.date) < new Date(next.date) ? prev : next
    }, earliestDate[0]).date)
  }

  GreatestDate = (group) => {
    let greatestDate = d3.greatest(group, ([date, value]) => {
      const greatest = d3.greatest(d3.group(value, el => el.date), ([idate,]) => {
        return new Date(idate).valueOf()
      })
      return new Date(greatest[0]).valueOf()
    })

    return new Date(greatestDate[1].reduce((prev, next) => {
      return new Date(prev.date) > new Date(next.date) ? prev : next
    }, greatestDate[0]).date)
  }

  GetContinentData = el => el.iso_code.startsWith('OWID')

  SetupAxes = () => {
    this.xAxisGroup = d3.select('#x-axis')
      .attr('transform', `translate(${this.left}, ${this.height - this.bottom})`)

    this.xAxisGroup.append('text')
      .attr('transform', `translate(${(this.width - this.left) / 2}, 40)`)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .text('Date')

    this.yAxisGroup = d3.select('#y-axis')
      .attr('transform', `translate(${this.left}, ${this.top})`)

    this.yAxisGroup.append('text')
      .attr('transform', `translate(-60, ${(this.height - this.bottom) / 2}) rotate(-90)`)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .text('Cases per million')
  }

  RenderAxes = (data) => {
    const earliestDate = this.EarliestDate(data)
    const greatestDate = this.GreatestDate(data)

    this.xScale = d3.scaleTime()
      .domain([earliestDate, greatestDate])
      .range([0, this.width])
      .nice()

    this.xAxis.scale(this.xScale)

    this.xAxisGroup.transition()
      .duration(this.animationDuration)
      .call(this.xAxis)

    const maxY = this.GreatestValue(data)

    this.yScale = d3.scaleLinear()
      .domain([0, maxY])
      .range([this.height - this.bottom - this.top, 0]) // invert axis
      .nice()

    this.yAxis.scale(this.yScale)

    this.yAxisGroup.transition()
      .duration(this.animationDuration)
      .call(this.yAxis)
  }

  RenderLines = (data) => {
    const lineGen = d3.line()
      .x(el => this.left + this.xScale(new Date(el.date)))
      .y(el => this.yScale(el.total_cases_per_million) + this.top)

    const content = this.chartSVG.select('#lines')

    content.selectAll('path')
      .data(data) // create a one object array to activate the join
      .join(
        (enter) => {
          return enter.append('path')
            .classed('line-chart', true)
            .datum(el => el[1])
            .attr('d', lineGen)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('opacity', 0)
            .transition()
            .duration(this.animationDuration)
            .attr('opacity', 1)
        },
        (update) => {
          return update.datum(el => el[1])
            .transition()
            .duration(this.animationDuration)
            .attr('d', lineGen)
        },
        (exit) => {
          return exit.transition()
            .duration(this.animationDuration)
            .attr('opacity', 0)
            .remove()
        }
      )
  }

  updateSelectedCountries() {
    const sel = this.globalApplicationState.selectedLocations
    const worldMap = this.globalApplicationState.worldMap
    if (sel.length > 0) {
      const selData = []
      // Update charts with selection
      sel.forEach((el) => {
        selData.push([el, worldMap.CasesForCountry(el)])
      })
      this.RenderAxes(selData)
      this.RenderLines(selData)
    } else {
      this.RenderAxes(this.continents)
      this.RenderLines(this.continents)
    }
  }
}
