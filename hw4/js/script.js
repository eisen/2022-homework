(() => {
  // ******* DATA LOADING *******
  // We took care of that for you
  async function loadData() {
    const covidData = await d3.csv('data/owid-covid.csv')
    const mapData = await d3.json('data/world.json')
    return { covidData, mapData }
  }


  // ******* STATE MANAGEMENT *******
  // This should be all you need, but feel free to add to this if you need to 
  // communicate across the visualizations
  const globalApplicationState = {
    selectedLocations: [],
    covidData: null,
    mapData: null,
    worldMap: null,
    lineChart: null,
  }


  //******* APPLICATION MOUNTING *******
  loadData().then((loadedData) => {
    // console.log('Here is the imported data:', loadedData.covidData)

    // Store the loaded data into the globalApplicationState
    // Remove data with empty total_cases_per_million field
    globalApplicationState.covidData = loadedData.covidData.filter( el => el.total_cases_per_million !== '')

    globalApplicationState.mapData = 
      topojson.feature(loadedData.mapData, loadedData.mapData.objects.countries)
    
    // Remove data with invalid iso codes (-99)
    globalApplicationState.mapData.features = globalApplicationState.mapData.features.filter( feature => feature.id !== '-99' ) 

    // Creates the view objects with the global state passed in 
    const worldMap = new MapVis(globalApplicationState)
    const lineChart = new LineChart(globalApplicationState)

    globalApplicationState.worldMap = worldMap
    globalApplicationState.lineChart = lineChart

    //TODO add interactions for Clear Selected Countries button
  })
})()
