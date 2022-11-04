d3.csv('./data/words-without-force-positions.csv').then((data) => {
    const chart = bubbleChart(data)
    const sim = simulation(data, chart)
    const tab = table(chart)

    chart.update(sim, tab)
})