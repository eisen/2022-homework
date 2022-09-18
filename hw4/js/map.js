/** Class representing the map view. */
class MapVis {

  svg = null

  /**
   * Creates a Map Visuzation
   * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
   */
  constructor(globalApplicationState) {
    this.globalApplicationState = globalApplicationState

    this.svg = d3.select('#map')

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

    const lineGen = d3.line()
      .x(el => projection(el)[0])
      .y(el => projection(el)[1])

    ule.selectAll('path')
      .data(graticuleUle)
      .join(
        (enter) => {
          return enter.append('path')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', 'lightgray')
        },
        (update) => {

        },
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
        (update) => {

        },
        (exit) => { }
      )

    let countries = this.svg.select('#countries')

    countries.selectAll('path')
      .data(this.globalApplicationState.mapData.features)
      .join(
        (enter) => {
          return enter.append('path')
            .attr('d', path)
            .attr('fill', 'white')
            .attr('stroke', 'black')
        },
        (update) => {

        },
        (exit) => { }
      )
  }

  updateSelectedCountries() {

  }
}
