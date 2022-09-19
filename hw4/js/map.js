/** Class representing the map view. */
class MapVis {

  svg = null
  totalCases = 0
  colorScale = null

  width = 800
  height = 500

  legend_height = 15
  legend_width = 200

  MaxVal = (prev, next) => parseFloat(prev.total_cases_per_million) > parseFloat(next.total_cases_per_million) ? prev : next
  CasesForCountry = (iso_code) => this.globalApplicationState.covidData.filter(el => el.iso_code === iso_code && el.total_cases_per_million !== '')

  /**
     * Creates a Map Visuzation
     * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
     */
  constructor(globalApplicationState) {
    this.globalApplicationState = globalApplicationState

    this.svg = d3.select('#map')

    const startValue = this.globalApplicationState.covidData[0]
    this.totalCases = this.globalApplicationState.covidData
      .reduce(this.MaxVal, startValue).total_cases_per_million

    this.CreateLegend()

    this.colorScale = d3.scaleLinear()
      .domain([0, this.totalCases / 2, this.totalCases])
      .range(['#fff5f0', '#f96c4f', '#68010d'])
      .interpolate(d3.interpolateRgb)

    // Set up the map projection
    const projection = d3.geoWinkel3()
      .scale(150) // This set the size of the map
      .translate([this.width / 2, this.height / 2]) // This moves the map to the center of the SVG

    let path = d3.geoPath()
      .projection(projection)

    this.RenderGraticule(path)
    this.RenderCountries(path)
  }

  CreateLegend = () => {
    const legend = this.svg
      .append('g')
      .classed('legend', true)
      .attr('transform', `translate(0, ${this.height - this.legend_height})`)

    legend.append('text')
      .text('0')
      .attr('y', -5)

    const text_format = d3.formatPrefix(',.0', 1e3)
    legend.append('text')
      .text(text_format(this.totalCases))
      .attr('x', this.legend_width)
      .attr('y', -5)
      .attr('text-anchor', 'end')

    legend.append('rect')
      .attr('rx', 7)
      .attr('ry', 7)
      .attr('width', this.legend_width)
      .attr('height', this.legend_height)
      .attr('fill', 'url(#Gradient)')
      .attr('stroke', 'black')
  }

  RenderGraticule = (path) => {
    let graticuleGen = d3.geoGraticule()

    // Render graticule ule
    let ule = this.svg.select('#graticules')
      .append('g')
      .classed('ule', true)

    let graticuleUle = graticuleGen.lines()

    ule.selectAll('path')
      .data(graticuleUle)
      .join(
        (enter) => {
          return enter.append('path')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', 'lightgray')
        },
        (update) => { },
        (exit) => { }
      )

    // Render graticule outline
    let outline = this.svg.select('#graticules')
      .append('g')
      .classed('outline', true)

    let graticuleOutline = graticuleGen.outline()

    outline.selectAll('path')
      .data(graticuleOutline.coordinates)
      .join(
        (enter) => {
          return enter.append('path')
            .datum(graticuleOutline)
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
        },
        (update) => { },
        (exit) => { }
      )
  }

  RenderCountries = (path) => {
    // Render countries
    let countries = this.svg.select('#countries')
    countries.selectAll('path')
      .data(this.globalApplicationState.mapData.features)
      .join(
        (enter) => {
          return enter.append('path')
            .attr('d', path)
            .attr('cursor', 'pointer')
            .attr('fill', el => {
              const countryCases = this.CasesForCountry(el.id)
              let countryTotal = 0
              if (countryCases.length > 0) {
                countryTotal = countryCases.reduce(this.MaxVal, countryTotal).total_cases_per_million
              }
              return this.colorScale(countryTotal)
            })
            .attr('title', el => el.id)
            .attr('stroke', 'lightgray')
            .on('mouseover', el => {
              d3.select(el.target)
                .attr('stroke', 'gray')
                .raise()
            })
            .on('mouseout', el => d3.select(el.target)
              .attr('stroke', 'lightgray'))
        },
        (update) => {

        },
        (exit) => { }
      )
  }

  updateSelectedCountries() {

  }
}
