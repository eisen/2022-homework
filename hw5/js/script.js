// preGrouped = d3.json('./data/senate_polls.json')
const extraCredit = d3.csv('./data/senate_polls.csv')


Promise.all([d3.csv('./data/senate_forecasts.csv'), extraCredit]).then(data => {
    let forecastData = data[0]
    let pollData = d3.rollups(data[1], v => {
        const result = {
            name: v[0].pollster,
            margin: 0,
            state: v[0].state
        }

        const reps = v.filter(d => d.party === 'REP')
        const repMargin = reps.length > 0 ? d3.mean(reps, d => parseFloat(d.pct)) : 0
        const dems = v.filter(d => d.party === 'DEM')
        const demMargin = dems.length > 0 ? d3.mean(dems, d => parseFloat(d.pct)) : 0
        
        result.margin = repMargin - demMargin

        return result
    }, d => d.state, d => d.poll_id).map(el => [el[0], el[1].map(p => p[1])])

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
