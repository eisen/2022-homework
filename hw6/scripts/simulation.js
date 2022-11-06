const simulation = (data, props) => {

    const tooltipHeight = 90
    const tooltipWidth = 200
    const tooltipMargin = 10

    const bubblesGroup = d3.select('#bubbles')
    const bubble_chart = d3.select('#bubble-chart')
    const tooltip = bubble_chart.append('g')
        .attr('id', 'tooltip')

    for (const d of data) {
        d.position = d.percent_of_r_speeches - d.percent_of_d_speeches
    }

    const OnMouseOver = (e, d) => {
        if (props.highlighted) {
            return
        }
        const phrase = `${d.phrase.charAt(0).toUpperCase()}${d.phrase.slice(1)}`
        const partisanUse = `${d.position < 0 ? 'D' : 'R'}+ ${d.position < 0 ? -d.position.toFixed(4) : d.position.toFixed(4)}%`
        const percentage = `In ${d.total * 2}% of speeches`

        d3.select(e.target)
            .attr('stroke', 'black')

        const tooltipX = d.position < 0 ? d.x + props.scaleRadius(d.total) + tooltipMargin : d.x - props.scaleRadius(d.total) - tooltipWidth - tooltipMargin
        const tooltipY = props.grouped ? (props.height - tooltipHeight) * 0.5 + props.margin : (props.categoryIndex(d.category) * props.height) + (props.height - tooltipHeight) * 0.5 + props.margin
        tooltip.attr('opacity', 1)
            .attr('transform', `translate(${tooltipX}, ${tooltipY})`)

        tooltip.selectAll('rect')
            .data([0])
            .join('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', tooltipWidth)
            .attr('height', tooltipHeight)
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
            .attr('y', (el, i) => i * (tooltipHeight / 3) + 20)
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
        bubblesGroup.selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
    }

    const yForce = d3.forceY().y(d => props.grouped ? (props.height / 2) : (props.categoryIndex(d.category) + 0.5) * props.height)
    const sim = d3.forceSimulation(data)
        .force("x", d3.forceX().x(d => props.scaleX(parseInt(d.position))))
        .force("y", yForce)
        .force("collide", d3.forceCollide().radius(d => props.scaleRadius(d.total) + 0.5))

    sim.on("tick", ticked)

    const bubbles = bubblesGroup.selectAll('circle')
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

    const OnStart = (grouped) => {
        props.grouped = grouped
        sim.force('x').initialize(data)
        sim.force('y').initialize(data)
        sim.force('collide').initialize(data)
        sim.alpha(1)
            .restart()
    }

    const OnHighlight = (value) => {
        props.highlighted = value
    }

    return {
        start: OnStart,
        highlight: OnHighlight,
        bubbles: bubbles
    }
}       