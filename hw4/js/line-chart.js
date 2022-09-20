/** Class representing the line chart view. */
class LineChart {

  continents = null
  chartSVG = null

  width = 800
  height = 500

  left = 80
  bottom = 50

  startDate = 0
  endDate = 0

  xAxis = d3.axisBottom()
    .tickFormat(d3.timeFormat('%b %G'))

  yAxis = d3.axisLeft()

  /**
   * Creates a LineChart
   * @param globalApplicationState The shared global application state (has the data and map instance in it)
   */
  constructor(globalApplicationState) {
    // Set some class level variables
    this.globalApplicationState = globalApplicationState

    this.continents = d3.group(globalApplicationState.covidData.filter(this.GetContinentData), el => el.location)
    console.log(this.continents)

    this.chartSVG = d3.select('#line-chart')

    const xAxis = d3.select('#x-axis')
      .attr('transform', `translate(${this.left}, ${this.height - this.bottom})`)

    d3.select('#y-axis')
      .attr('transform', `translate(${this.left}, 0)`)

    const earliestDate = this.EarliestDate(this.continents)
    const greatestDate = this.GreatestDate(this.continents)

    console.log(earliestDate, greatestDate)

    const xScale = d3.scaleTime()
      .domain([earliestDate, greatestDate])
      .range([0, this.width])
      .nice()

    this.xAxis.scale(xScale)

    xAxis.transition()
        .call(this.xAxis)

  }

  EarliestDate = (group) => {
    let earliestDate = d3.least(group, ([date, value]) => {
      const least = d3.least(d3.group(value, el => el.date), ([idate, ]) => {
        return new Date(idate).valueOf()
      })
      return new Date(least[0]).valueOf()
    })

    return new Date(earliestDate[1].reduce( (prev, next) => {
      return new Date(prev.date) < new Date(next.date) ? prev : next
    }, earliestDate[0]).date)
  }

  GreatestDate = (group) => {
    let greatestDate = d3.greatest(group, ([date, value]) => {
      const greatest = d3.greatest(d3.group(value, el => el.date), ([idate, ]) => {
        return new Date(idate).valueOf()
      })
      return new Date(greatest[0]).valueOf()
    })

    return new Date(greatestDate[1].reduce( (prev, next) => {
      return new Date(prev.date) > new Date(next.date) ? prev : next
    }, greatestDate[0]).date)
  }

  GetContinentData = el => el.iso_code.startsWith('OWID')

  updateSelectedCountries() {

  }
}
