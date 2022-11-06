const bubbleChart = (data) => {

    const xMargin = 20
    const yMargin = 20
    const bubbleMargin = 60
    const textMargin = 20
    const labels = [{ value: 'Democratic Leaning', class: "democrat" }, { value: 'Republican Leaning', class: "republican" }]
    const legendTicks = [-50, -40, -30, -20, -10, 10, 20, 30, 40, 50]
    const highlightHeight = 90
    const highlightWidth = 300
    const highlightMargin = 10

    const height = 150
    const legendHeight = 30

    let calc_height = height + bubbleMargin

    let duration = 300
    let sim = null
    let tab = null
    let activeBrush = null
    let activeBrushNode = null

    const OnBrush = ({ selection }, props) => {
        if (highlight) {
            return
        }

        if (activeBrush && props.brushGroup !== activeBrushNode) {
            activeBrushNode.call(activeBrush.move, null)
        }
        activeBrush = props.brush
        activeBrushNode = props.brushGroup

        sim.bubbles
            .attr('stroke', 'gray')
            .attr('fill', 'gray')

        if (selection) {
            const [x0, x1] = selection
            const values = sim.bubbles.filter(d => x0 < d.x && d.x < x1 && props.y0 < d.y && d.y < props.y1)
                .attr('fill', d => scaleColor(d.category))
                .data()

            tab.update(values)
        } else {
            sim.bubbles
                .attr('stroke', 'lightgray')
                .attr('fill', d => scaleColor(d.category))
            tab.update(data)
        }
    }

    const OnUpdate = (runSim, in_sim, in_tab) => {
        if (sim === null) {
            sim = in_sim
        }

        if (tab === null) {
            tab = in_tab
        }

        bubble_chart.transition()
            .duration(duration)
            .attr('height', calc_height)

        if (!grouped) {
            category_labels.selectAll('text')
                .data(byCategories)
                .enter()
                .append('text')
                .text(d => d[0])
                .attr('font-weight', 'bold')
                .attr('font-family', 'Arial, Helvetica, sans-serif')
                .attr('fill', 'gray')
                .attr('x', 10)
                .attr('y', bubbleMargin)
                .attr('opacity', 0)
                .transition()
                .duration(duration)
                .attr('y', (d, i) => i * height + bubbleMargin + textMargin)
                .attr('opacity', 1)

            category_labels.selectAll('line')
                .data(d => new Array(d3.maxIndex(byCategories) + 2))
                .enter()
                .append('line')
                .attr('stroke', 'lightgray')
                .attr('stroke-width', 3)
                .attr('x1', d => scaleX(-60))
                .attr('x2', d => scaleX(60))
                .attr('y1', 80)
                .attr('y2', 80)
                .attr('opacity', 0)
                .transition()
                .duration(duration)
                .attr('y1', (d, i) => i * height + bubbleMargin)
                .attr('y2', (d, i) => i * height + bubbleMargin)
                .attr('opacity', 1)

        } else {
            category_labels.selectAll('text')
                .data([])
                .exit()
                .transition()
                .duration(duration)
                .attr('y', 80)
                .attr('opacity', 0)
                .remove()

            category_labels.selectAll('line')
                .data([])
                .exit()
                .transition()
                .duration(duration)
                .attr('y1', 80)
                .attr('y2', 80)
                .attr('opacity', 0)
                .remove()
        }

        // Setup Brushes
        activeBrush = null
        activeBrushNode = null

        brushes.selectAll('g')
            .remove()

        brushes.selectAll('g')
            .data(d => !grouped ? byCategories : [0])
            .enter()
            .append('g')
            .attr('class', 'brushes')
            .attr('transform', (d, i) => `translate(${0}, ${i * height + 60})`)
            .append('rect')
            .attr('x', 0)
            .attr('width', scaleX(60))
            .attr('y', 0)
            .attr('height', (d, i) => height)
            .attr('fill', 'none')

        const brushGroups = d3.selectAll('.brushes')

        brushGroups.each((d, i, n) => {
            const brushGroup = d3.select(n[i])
            const y0 = i * height
            const y1 = y0 + height

            const brush = d3.brushX()
                .extent([[0, 0], [scaleX(60), height]])
                .on('start brush', d => OnBrush(d, { "y0": y0, "y1": y1, "brush": brush, "brushGroup": brushGroup }))
                .on('end', d => {
                    if (highlight) {
                        toggleHighlight()
                        return
                    }
                    OnBrush(d, { "y0": y0, "y1": y1, "brush": brush, "brushGroup": brushGroup })
                })

            brushGroup.call(brush)
        })

        if (runSim) {
            sim.start(grouped)
        }
        tab.update(data)
    }

    const svg = d3.select('#content')
        .append('svg')
        .attr('id', 'bubble-chart')
        .attr('width', '67%')
        .attr('height', height + bubbleMargin)

    const bubble_chart = d3.select('#bubble-chart')

    let grouped = true
    const toggleGrouping = (ev) => {
        if (highlight) {
            toggleHighlight()
        }
        const button = d3.select(ev.target)
        const background = button.select('#background')
        const foreground = button.select('#foreground')

        background.classed('bg-gray-200', !grouped).classed('bg-steelblue', grouped)
        foreground.classed('translate-x-0', !grouped).classed('translate-x-5', grouped)

        grouped = !grouped
        calc_height = grouped ? height + bubbleMargin : category_size * height + bubbleMargin + 1
        sim.bubbles
            .attr('stroke', 'lightgray')
            .attr('fill', d => scaleColor(d.category))
        OnUpdate(true)
    }

    d3.select('#toggle').on('click', toggleGrouping)

    let highlight = false
    const toggleHighlight = () => {
        highlight = !highlight
        sim.highlight(highlight)

        const demHighlightX = highlight ? demBubble.x + highlightMargin : -highlightWidth
        const repHighlightX = highlight ? repBubble.x - highlightWidth - highlightMargin : -highlightWidth
        const demHighlightY = grouped ? (height - highlightHeight) * 0.5 + bubbleMargin : (categoryIndex(demBubble.category) * height) - (height + highlightHeight) * 0.5 + bubbleMargin
        const repHighlightY = grouped ? (height - highlightHeight) * 0.5 + bubbleMargin : (categoryIndex(demBubble.category) * height) - (height + highlightHeight) * 0.5 + bubbleMargin
        demHighlight.attr('transform', `translate(${demHighlightX}, ${demHighlightY})`)
        repHighlight.attr('transform', `translate(${repHighlightX}, ${repHighlightY})`)

        if (highlight) {
            demHighlight.selectAll('line')
                .data([demBubble])
                .join('line')
                .attr('x1', d => 0)
                .attr('x2', d => -highlightMargin)
                .attr('y1', d => highlightHeight - highlightMargin)
                .attr('y2', d => d.y - height * 0.5 + highlightHeight * 0.5 + scaleRadius(parseInt(d.total)))
                .attr('stroke', 'black')
                .attr('stroke-width', 2)

            demHighlight.selectAll('circle')
                .data([demBubble])
                .join('circle')
                .attr('cx', d => -highlightMargin)
                .attr('cy', d => d.y - height * 0.5 + highlightHeight * 0.5)
                .attr('r', d => props.scaleRadius(parseInt(d.total)))
                .attr('fill', 'steelblue')
                .attr('stroke', 'black')

            repHighlight.selectAll('line')
                .data([repBubble])
                .join('line')
                .attr('x1', d => highlightWidth)
                .attr('x2', d => d.x - repHighlightX)
                .attr('y1', d => highlightHeight - highlightMargin)
                .attr('y2', d => d.y - height * 0.5 + highlightHeight * 0.5 + scaleRadius(parseInt(d.total)))
                .attr('stroke', 'black')
                .attr('stroke-width', 2)

            repHighlight.selectAll('circle')
                .data([repBubble])
                .join('circle')
                .attr('cx', d => d.x - repHighlightX)
                .attr('cy', d => d.y - height * 0.5 + highlightHeight * 0.5)
                .attr('r', d => props.scaleRadius(parseInt(d.total)))
                .attr('fill', 'firebrick')
                .attr('stroke', 'black')
        } else {
            demHighlight.selectAll('line')
                .remove()
            demHighlight.selectAll('circle')
                .remove()

            repHighlight.selectAll('line')
                .remove()
            repHighlight.selectAll('circle')
                .remove()
        }

        OnUpdate(false) // Don't rerun sim
    }

    d3.select('#highlight').on('click', toggleHighlight)

    const byCategories = d3.group(data, d => d.category)
    const category_size = d3.maxIndex(byCategories.keys()) + 1

    const scaleColor = d3.scaleOrdinal()
        .domain([byCategories.keys()])
        .range(d3.schemePastel1)

    const minTotal = d3.min(data, d => parseInt(d.total))
    const maxTotal = d3.max(data, d => parseInt(d.total))

    const scaleRadius = d3.scaleLinear()
        .domain([minTotal, maxTotal])
        .range([2.5, 10.5])

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
        .attr('y2', (d, i) => category_size * height + bubbleMargin)
        .attr('stroke', d => d < 0 ? 'steelblue' : d > 0 ? 'firebrick' : 'black')
        .attr('stroke-width', d => d % 10 === 0 ? 3 : 1)
        .attr('opacity', "0.15")

    lines.append('line')
        .attr('x1', d => scaleX(0))
        .attr('x2', d => scaleX(0))
        .attr('y1', 0)
        .attr('y2', (d, i) => category_size * height + bubbleMargin)
        .attr('stroke', 'gray')
        .attr('stroke-width', 2)
        .attr('opacity', "0.15")

    // Setup Brushes
    const brushes = svg.append('g')
        .attr('id', 'brushes')

    // Setup Bubbles
    const bubbles = svg.append('g')
        .attr('id', 'bubbles')
        .attr('transform', `translate(0, ${bubbleMargin})`)

    // Setup Categories
    const category_labels = bubble_chart.append('g')
        .attr('id', 'category-labels')

    // Setup highlights
    const demBubble = d3.filter(data, d => d.phrase === "minimum wage")[0]
    const repBubble = d3.filter(data, d => d.phrase === "doing business")[0]

    const demHighlight = bubble_chart.append('g')
        .attr('id', 'dem-highlight')
        .attr('transform', `translate(${-highlightWidth}, 0)`)

    demHighlight.selectAll('rect')
        .data([demBubble])
        .join('rect')
        .attr('x', d => 0)
        .attr('y', d => 0)
        .attr('width', highlightWidth)
        .attr('height', highlightHeight)
        .attr('rx', 5)
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('fill', 'white')
        .attr('opacity', 0.75)

    demHighlight.selectAll('text')
        .data([`Democrats spoke ${demBubble.percent_of_d_speeches}%`, `about "${demBubble.phrase}" while`, `Republicans didn't mention it once`])
        .join('text')
        .text(d => d)
        .attr('text-anchor', 'middle')
        .attr('x', d => 150)
        .attr('y', (d, i) => i * (highlightHeight / 3) + 20)
        .attr('font-family', 'Arial, Helvetica, sans-serif')
        .attr('stroke', 'gray')

    const repHighlight = bubble_chart.append('g')
        .attr('id', 'rep-highlight')
        .attr('transform', `translate(${-highlightWidth}, 0)`)

    repHighlight.selectAll('rect')
        .data([repBubble])
        .join('rect')
        .attr('x', d => 0)
        .attr('y', d => 0)
        .attr('width', highlightWidth)
        .attr('height', highlightHeight)
        .attr('rx', 5)
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr('fill', 'white')
        .attr('opacity', 0.75)

    repHighlight.selectAll('text')
        .data([`Republicans spoke ${repBubble.percent_of_r_speeches}%`, `about "${repBubble.phrase}" while`, `Democrats didn't mention it once`])
        .join('text')
        .text(d => d)
        .attr('text-anchor', 'middle')
        .attr('x', d => 150)
        .attr('y', (d, i) => i * (highlightHeight / 3) + 20)
        .attr('font-family', 'Arial, Helvetica, sans-serif')
        .attr('stroke', 'gray')

    const categoryIndex = (category) => {
        let idx = -1
        for (key of byCategories.keys()) {
            idx += 1
            if (key === category) {
                return idx
            }
        }
        return -1
    }

    const props = {
        scaleX: scaleX,
        scaleColor: scaleColor,
        scaleRadius: scaleRadius,
        height: height,
        margin: bubbleMargin,
        grouped: grouped,
        highlighted: highlight,
        update: OnUpdate,
        categoryIndex: categoryIndex
    }

    return props
}

