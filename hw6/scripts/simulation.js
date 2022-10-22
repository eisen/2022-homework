const simulation = (data, props) => {

    for (const d of data) {
        d.position = d.percent_of_r_speeches - d.percent_of_d_speeches
    }

    const bubbles = d3.select('#bubbles')

    const byCategories = d3.group(data, d => d.category)

    const scaleColor = d3.scaleOrdinal()
        .domain([byCategories.keys()])
        .range(d3.schemePastel1)

    const ticked = () => {
        bubbles.selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.total/3.5)
            .attr('fill', d => scaleColor(d.category))
            .attr('stroke', 'lightgray')
    }

    const sim = d3.forceSimulation(data)
        .force("x", d3.forceX().x(d => props.scaleX(parseInt(d.position))))
        .force("y", d3.forceY().y(props.height/2))
        .force("collide", d3.forceCollide().radius(d => (d.total/3.5) + 0.5))

    bubbles.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => parseInt(d.total))
        .attr('fill', d => scaleColor(d.category))
        .attr('stroke', 'lightgray')

    sim.on("tick", ticked)
}   