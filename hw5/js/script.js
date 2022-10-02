preGrouped = d3.json('./data/senate_polls.json')
extraCredit = d3.csv('./data/senate_polls.csv')

byPercentage = (c1, c2) => parseFloat(c1.pct) > parseFloat(c2.pct) ? c1 : c2

Promise.all([d3.csv('./data/senate_forecasts.csv'), extraCredit, preGrouped]).then(data => {
    let forecastData = data[0]
    let pollData = d3.rollups(data[1], v => {
        const result = {
            name: v[0].pollster,
            margin: 0,
            state: v[0].state
        }

        const repMargin = v.filter( d => d.party === 'REP').reduce( byPercentage, { pct: "0"})
        const demMargin = v.filter( d => d.party === 'DEM').reduce( byPercentage, { pct: "0"})
        result.margin = repMargin.pct - demMargin.pct

        return result
    }, d => d.state, d => d.poll_id).map( el => [el[0], el[1].map( p => p[1])])

    /////////////////
    // EXTRA CREDIT//
    /////////////////
    /**
     * replace preGrouped with extraCredit and uncomment the line that defines extraCredit.
     * Then use d3.rollup to group the csvfile on the fly.
     * 
     * If you are not doing the extra credit, you do not need to change this file.
     */

    rolledPollData = new Map(pollData) //  convert to a Map object for consistency with d3.rollup
    let table = new Table(forecastData, rolledPollData)
    table.drawTable()
})
