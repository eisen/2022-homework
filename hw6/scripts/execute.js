d3.csv('./data/words-without-force-positions.csv').then((data) => {
    const chart = bubbleChart(data)
    table(data, chart)
    simulation(data, chart)
})