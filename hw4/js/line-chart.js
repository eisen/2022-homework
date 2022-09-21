/** Class representing the line chart view. */
class LineChart {

  continents = null
  selData = null
  chartSVG = null
  content = null

  width = 700
  height = 500

  left = 80
  right = 30
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

    this.content = this.chartSVG.select('#lines')

    this.content.append('rect')
      .attr('x', this.left)
      .attr('y', this.top)
      .attr('width', this.width - this.left - this.right)
      .attr('height', this.height - this.top - this.bottom)
      .attr('fill', 'white')
      .on('mousemove', (el) => {
        this.UpdateOverlay(el)
      })

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

  GetCountrytData = el => el.iso_code.startsWith('OWID') === false

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
      .range([0, this.width - this.left - this.right])
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

  OnLeftSide = (x) => x - this.left < (this.width - this.left - this.right) * 0.5
    ? true : false

  UpdateOverlay = (el) => {
    const x = el.offsetX
    d3.select('#overlay line')
      .attr('stroke', 'black')
      .attr('y1', 0)
      .attr('y2', this.height - this.bottom)
      .attr('x1', x)
      .attr('x2', x)

    const names = Array.from(this.selData, ([key,]) => key)
    const date = this.xScale.invert(x - this.left)
    const labels = []

    const year = date.toLocaleString("default", { year: "numeric" })
    const month = date.toLocaleString("default", { month: "2-digit" })
    const day = date.toLocaleString("default", { day: "2-digit" })

    names.forEach(el => {
      const data = this.selData.get(el).filter(el => {
        return el.date === `${year}-${month}-${day}`
      })[0]

      if (data) {
        const cases = parseFloat(data.total_cases_per_million)
        labels.push({
          location: el,
          cases: cases
        })
      }
    })

    labels.sort((a, b) => b.cases - a.cases) // Descending sort

    const text_format = d3.formatPrefix(',.1', 1e3)
    d3.select('#overlay')
      .selectAll('text')
      .data(labels)
      .join(
        (enter) => {
          enter.append('text')
            .text(el => `${el.location}, ${text_format(el.cases)}`)
            .attr('x', this.OnLeftSide(x) ? x + 10 : x - 10)
            .attr('y', (el, idx) => this.top + idx * 20 + 10)
            .attr('text-anchor', this.OnLeftSide(x) ? 'start' : 'end')
            .attr('fill', 'black')
            .attr('opacity', 1)
        },
        (update) => {
          update.text(el => `${el.location}, ${text_format(el.cases)}`)
            .attr('x', this.OnLeftSide(x) ? x + 10 : x - 10)
            .attr('y', (el, idx) => this.top + idx * 20 + 10)
            .attr('text-anchor', this.OnLeftSide(x) ? 'start' : 'end')
        },
        (exit) => {
          exit.transition()
            .duration(this.animationDuration)
            .attr('opacity', 0)
            .remove()
        }
      )

  }

  RenderLines = (data) => {
    const lineGen = d3.line()
      .x(el => this.xScale(new Date(el.date)) + this.left)
      .y(el => this.yScale(el.total_cases_per_million) + this.top)

    this.content.selectAll('path')
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

    d3.selectAll('#overlay text').remove()
    d3.select('#overlay line').attr('x1', this.left).attr('x2', this.left)

    if (sel.length > 0) {
      this.selData = d3.group(this.globalApplicationState.covidData.filter(this.GetCountrytData)
        .filter(el => sel.includes(el.iso_code)), el => el.location)
    } else {
      this.selData = this.continents
    }
    this.RenderAxes(this.selData)
    this.RenderLines(this.selData)
  }
}
