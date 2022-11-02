const simulation = (data, props) => {

    const factor = 1 / 3

    const tooltip = d3.select('#bubble-chart')
        .append('g')

    for (const d of data) {
        d.position = d.percent_of_r_speeches - d.percent_of_d_speeches
    }

    const bubbles = d3.select('#bubbles')

    const OnMouseOver = (e, d) => {
        const phrase = `${d.phrase.charAt(0).toUpperCase()}${d.phrase.slice(1)}`
        const partisanUse = `${d.position < 0 ? 'D' : 'R'}+ ${d.position < 0 ? -d.position.toFixed(4) : d.position.toFixed(4)}%`
        const percentage = `In ${d.total * 2}% of speeches`

        d3.select(e.target)
            .attr('stroke', 'black')

        tooltip.attr('opacity', 1)
            .attr('transform', `translate(${d.position < 0 ? d.x + (d.total * factor) : d.x - (d.total * factor) - 200}, ${e.offsetY + (d.total * factor)})`)

        tooltip.selectAll('rect')
            .data([0])
            .join('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 200)
            .attr('height', 90)
            .attr('rx', 5)
            .attr('stroke', 'black')
            .attr('fill', 'white')
            .attr('opacity', 0.75)

        tooltip.selectAll('text')
            .data([phrase, partisanUse, percentage])
            .join('text')
            .text(el => el)
            .attr('text-anchor', 'middle')
            .attr('x', el => 100)
            .attr('y', (el, i) => i * 30 + 20)
            .attr('font-family', 'Arial, Helvetica, sans-serif')
            .attr('stroke', 'lightgray')
    }

    const OnMouseOut = (e) => {
        d3.select(e.target)
            .attr('stroke', 'lightgray')

        tooltip.attr('opacity', 0)
            .attr('transform', `translate(${-200}, ${-60})`)
    }

    const ticked = () => {
        bubbles.selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.total * factor)
            .attr('fill', d => props.scaleColor(d.category))
    }

    const sim = d3.forceSimulation(data)
        .force("x", d3.forceX().x(d => props.scaleX(parseInt(d.position))))
        .force("y", d3.forceY().y(props.height / 2))
        .force("collide", d3.forceCollide().radius(d => (d.total * factor) + 0.5))

    bubbles.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => props.scaleRadius(parseInt(d.total)))
        .attr('fill', d => props.scaleColor(d.category))
        .attr('stroke', 'lightgray')
        .classed('clickable', true)
        .on('mouseover', OnMouseOver)
        .on('mouseout', OnMouseOut)

    sim.on("tick", ticked)
}       