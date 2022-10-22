const bubbleChart = (data) => {

    const legendHeight = 30
    const xMargin = 20
    const yMargin = 20
    const labels = [{ value: 'Democratic Leaning', class: "democrat" }, { value: 'Republican Leaning', class: "republican" }]
    const legendTicks = [-50, -40, -30, -20, -10, 10, 20, 30, 40, 50]

    const minY = d3.min(data, d => parseFloat(d.sourceY))
    const maxY = d3.max(data, d => parseFloat(d.sourceY))
    const height = maxY - minY + 10

    const svg = d3.select('body')
        .append('svg')
        .attr('width', '67%')
        .attr('height', '100%')

    const bbox = svg.node().getBoundingClientRect()

    svg.selectAll('text')
        .data(labels)
        .join('text')
        .text(d => d.value)
        .attr('class', d => d.class)
        .attr('y', yMargin)
        .attr('x', (d, i) => `${i * 100}%`)
        .attr('text-anchor', (d, i) => i === 0 ? 'start' : 'end')
        .attr('font-weight', 'bold')
        .attr('font-family', 'Arial, Helvetica, sans-serif')

    const scaleX = d3.scaleLinear()
        .domain([-55, 55])
        .range([xMargin, bbox.width - xMargin])

    // Setup Legend
    const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(0, ${yMargin})`)
        .attr('width', bbox.width)
        .attr('height', legendHeight)

    legend.selectAll('text')
        .data(legendTicks)
        .join('text')
        .text(d => {
            if (d > 0) {
                return `${d}`
            } else if (d < 0) {
                return `${-d}`
            } else {
                return '0'
            }
        })
        .attr('text-anchor', 'middle')
        .attr('x', d => scaleX(d))
        .attr('y', legendHeight)
        .attr('font-weight', 'bold')
        .attr('font-family', 'Arial, Helvetica, sans-serif')
        .attr('class', d => d < 0 ? 'democrat' : 'republican')

    legend.append('text')
        .text('0')
        .attr('text-anchor', 'middle')
        .attr('x', d => scaleX(0))
        .attr('y', legendHeight)
        .attr('font-weight', 'bold')
        .attr('font-family', 'Arial, Helvetica, sans-serif')

    legend.selectAll('line')
        .data(legendTicks)
        .join('line')
        .attr('x1', d => scaleX(d))
        .attr('x2', d => scaleX(d))
        .attr('y1', 5)
        .attr('y2', 15)
        .attr('stroke', d => d < 0 ? 'steelblue' : 'firebrick')
        .attr('stroke-width', 2)
        .attr('class', d => d < 0 ? 'democrat' : 'republican')

    legend.append('line')
        .attr('x1', d => scaleX(0))
        .attr('x2', d => scaleX(0))
        .attr('y1', 5)
        .attr('y2', 15)
        .attr('stroke', 'black')
        .attr('stroke-width', 2)

    // Setup Lines
    const lines = svg.append('g')
        .attr('id', 'lines')
        .attr('transform', `translate(0, ${yMargin * 3})`)

    lines.selectAll('line')
        .data(d3.range(-56, 57, 2))
        .join('line')
        .attr('x1', d => scaleX(d))
        .attr('x2', d => scaleX(d))
        .attr('y1', 0)
        .attr('y2', d => height)
        .attr('stroke', d => d < 0 ? 'steelblue' : 'firebrick')
        .attr('stroke-width', d => d % 10 === 0 ? 3 : 1)
        .attr('opacity', "0.15")

    lines.append('line')
        .attr('x1', d => scaleX(0))
        .attr('x2', d => scaleX(0))
        .attr('y1', 0)
        .attr('y2', d => height)
        .attr('stroke', 'gray')
        .attr('stroke-width', 2)
        .attr('opacity', "0.15")

    // Setup Bubbles
    const bubbles = svg.append('g')
        .attr('id', 'bubbles')
        .attr('transform', `translate(0, ${yMargin * 3})`)

    return {
        scaleX: scaleX,
        height: height
    }
}

Promise.all([d3.json('./data/words.json'), d3.csv('./data/words-without-force-positions.csv')]).then((data) => {
    const chart = bubbleChart(data[0])
    simulation(data[1], chart)
})