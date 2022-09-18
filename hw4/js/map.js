/** Class representing the map view. */
class MapVis {

  svg = null
  totalCases = 0
  colorScale = null


  maxVal = (prev, next) => parseFloat(prev.total_cases_per_million) > parseFloat(next.total_cases_per_million) ? prev : next
  casesForCountry = (iso_code) => this.globalApplicationState.covidData.filter(el => el.iso_code === iso_code && el.total_cases_per_million !== '')

  /**
   * Creates a Map Visuzation
   * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
   */
  constructor(globalApplicationState) {
    this.globalApplicationState = globalApplicationState

    this.svg = d3.select('#map')

    const startValue = this.globalApplicationState.covidData[0]
    this.totalCases = this.globalApplicationState.covidData.filter(el => el.total_cases_per_million !== '')
      .reduce(this.maxVal, startValue).total_cases_per_million

    console.log(this.totalCases)

    this.colorScale = d3.scaleLinear()
      .domain([0, this.totalCases])
      .range(['#FFFFFF', '#FF0000'])
      .interpolate(d3.interpolateRgb)

    // Set up the map projection
    const projection = d3.geoWinkel3()
      .scale(150) // This set the size of the map
      .translate([400, 250]) // This moves the map to the center of the SVG

    let path = d3.geoPath()
      .projection(projection)

    let ule = this.svg.select('#graticules')
      .append('g')
      .classed('ule', true)

    let outline = this.svg.select('#graticules')
      .append('g')
      .classed('outline', true)

    let graticuleGen = d3.geoGraticule()

    let graticuleUle = graticuleGen.lines()
    let graticuleOutline = graticuleGen.outline()

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

    let countries = this.svg.select('#countries')

    countries.selectAll('path')
      .data(this.globalApplicationState.mapData.features)
      .join(
        (enter) => {
          return enter.append('path')
            .attr('d', path)
            .attr('cursor', 'pointer')
            .attr('fill', el => {
              const id = el.id
              if(id === '-99') return 0
              
              const countryCases = this.casesForCountry(id)
              let countryTotal = 0
              if (countryCases.length > 0) {
                countryTotal = countryCases.reduce(this.maxVal, countryTotal).total_cases_per_million
              }
              return this.colorScale(countryTotal)
            })
            .attr('title', el => el.id)
            .attr('stroke', 'gray')
            .on('mouseover', el => {
              d3.select(el.target)
                .attr('stroke', 'black')
                .raise()
            })
            .on('mouseout', el => d3.select(el.target)
              .attr('stroke', 'gray'))
        },
        (update) => {

        },
        (exit) => { }
      )
  }

  updateSelectedCountries() {

  }
}
