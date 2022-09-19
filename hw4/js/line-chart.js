/** Class representing the line chart view. */
class LineChart {

  continents = null

  /**
   * Creates a LineChart
   * @param globalApplicationState The shared global application state (has the data and map instance in it)
   */
  constructor(globalApplicationState) {
    // Set some class level variables
    this.globalApplicationState = globalApplicationState

    this.continents = d3.group(globalApplicationState.covidData.filter(this.GetContinentData), el => el.location)
    console.log(this.continents)

  }

  GetContinentData = el => el.iso_code.startsWith('OWID')

  updateSelectedCountries () {

  }
}
