const bubbleChart = (data) => {

    const legendHeight = 30
    const xMargin = 20
    const yMargin = 20
    const labels = [{ value: 'Democratic Leaning', class: "democrat" }, { value: 'Republican Leaning', class: "republican" }]
    const legendTicks = [-50, -40, -30, -20, -10, 10, 20, 30, 40, 50]

    let height = 300
    let sim = null
    let duration = 300

    const OnUpdate = (in_sim) => {
        if (sim === null) {
            sim = in_sim
        }
        bubble_chart.transition()
            .duration(duration)
            .attr('height', height)
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
                .attr('y', 80)
                .attr('opacity', 0)
                .transition()
                .duration(duration)
                .attr('y', (d, i) => i * 150 + 80)
                .attr('opacity', 1)

            category_labels.selectAll('line')
                .data(byCategories)
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
                .attr('y1', (d, i) => (i + 1) * 150 + 60)
                .attr('y2', (d, i) => (i + 1) * 150 + 60)
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

        sim.start(grouped)
    }

    const svg = d3.select('#content')
        .append('svg')
        .attr('id', 'bubble-chart')
        .attr('width', '67%')
        .attr('height', height)

    const bubble_chart = d3.select('#bubble-chart')

    let grouped = true
    const toggleGrouping = (ev) => {
        const button = d3.select(ev.target)
        const background = button.select('#background')
        const foreground = button.select('#foreground')


        background.classed('bg-gray-200', !grouped).classed('bg-steelblue', grouped)
        foreground.classed('translate-x-0', !grouped).classed('translate-x-5', grouped)

        grouped = !grouped
        height = grouped ? 300 : category_size * 230 + 70
        OnUpdate()
    }

    d3.select('#toggle').on('click', toggleGrouping)

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
        .attr('y2', (d, i) => category_size * 150 + 70)
        .attr('stroke', d => d < 0 ? 'steelblue' : d > 0 ? 'firebrick' : 'black')
        .attr('stroke-width', d => d % 10 === 0 ? 3 : 1)
        .attr('opacity', "0.15")

    lines.append('line')
        .attr('x1', d => scaleX(0))
        .attr('x2', d => scaleX(0))
        .attr('y1', 0)
        .attr('y2', (d, i) => category_size * 150 + 70)
        .attr('stroke', 'gray')
        .attr('stroke-width', 2)
        .attr('opacity', "0.15")

    // Setup Bubbles
    const bubbles = svg.append('g')
        .attr('id', 'bubbles')
        .attr('transform', `translate(0, ${yMargin})`)

    const category_labels = bubble_chart.append('g')
        .attr('id', 'category-labels')

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
        update: OnUpdate,
        grouped: grouped,
        categoryIndex: categoryIndex
    }

    return props
}

