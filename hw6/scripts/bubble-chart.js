const bubbleChart = (data) => {

    const legendHeight = 30
    const xMargin = 20
    const yMargin = 20
    const labels = [{ value: 'Democratic Leaning', class: "democrat" }, { value: 'Republican Leaning', class: "republican" }]
    const legendTicks = [-50, -40, -30, -20, -10, 10, 20, 30, 40, 50]

    const height = 400

    const svg = d3.select('#content')
        .append('svg')
        .attr('id', 'bubble-chart')
        .attr('width', '67%')
        .attr('height', height)

    const byCategories = d3.group(data, d => d.category)

    const scaleColor = d3.scaleOrdinal()
        .domain([byCategories.keys()])
        .range(d3.schemePastel1)

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
        scaleColor: scaleColor,
        height: height
    }
}

