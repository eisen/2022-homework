const bubbleChart = (data) => {

    const legendHeight = 30
    const xMargin = 20
    const labels = ['Democratic Leaning', 'Republican Leaning']
    const legendTicks = [-50, -40, -30, -20, -10, 10, 20, 30, 40, 50]

    const svg = d3.select('body')
        .append('svg')
        .attr('width', '67%')
        .attr('height', '100%')

    const bbox = svg.node().getBoundingClientRect()

    svg.selectAll('text')
        .data(labels)
        .join('text')
        .text(d => d)
        .attr('y', 20)
        .attr('x', (d, i) => `${i * 100}%`)
        .attr('text-anchor', (d, i) => i === 0 ? 'start' : 'end')
        .attr('font-weight', 'bold')
        .attr('font-family', 'Arial, Helvetica, sans-serif')

    const scaleX = d3.scaleLinear()
        .domain([-50, 50])
        .range([xMargin, bbox.width - xMargin])

    // Setup Legend
    const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(0, 20)`)
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
}

d3.json('./data/words.json').then((data) => {
    bubbleChart(data)
})

