const table = (props) => {

    const xMargin = 20
    const yMargin = 20
    const headerHeight = 40
    const rowHeight = 25
    const widthModifier = 0.24

    let data = []

    const columns = [
        {
            id: "phrase",
            sort: "phrase",
            title: "Phrase",
            ascending: true,
            sorting: false,
            domain: [],
            alterFunc: d => d
        },
        {
            id: "frequency",
            sort: "position",
            title: "Frequency",
            ascending: false,
            sorting: false,
            domain: ["0.0", "0.5", "1.0"],
            alterFunc: d => Math.abs(d)
        },
        {
            id: "percentage",
            sort: "percentage",
            title: "Percentage",
            ascending: false,
            sorting: false,
            domain: [-100, -50, 0, 50, 100],
            alterFunc: d => d
        },
        {
            id: "total",
            sort: "total",
            title: "Total",
            ascending: false,
            sorting: false,
            domain: [],
            alterFunc: d => parseInt(d)
        },
    ]

    const svg = d3.select('#content')
        .append('svg')
        .attr('id', 'table')
        .attr('width', '33%')
        .attr('height', (data.length + 1) * rowHeight + headerHeight)

    const bbox = svg.node().getBoundingClientRect()

    const columnWidth = bbox.width * widthModifier

    const scaleFrequency = d3.scaleLinear()
        .domain([0, 1])
        .range([xMargin, columnWidth - xMargin])

    const scalePercentage = d3.scaleLinear()
        .domain([-100, 100])
        .range([xMargin, columnWidth - xMargin])

    // Render Header
    const header = svg.append('g')
        .attr('id', 'header')
        .attr('transform', `translate(${xMargin},${yMargin})`)

    header.selectAll('rect')
        .data(columns)
        .join('rect')
        .attr('id', d => d.id)
        .attr('width', '21%')
        .attr('height', headerHeight)
        .attr('rx', 5)
        .attr('fill', '#f0f8ff')
        .attr('x', (d, i) => i * columnWidth)
        .classed('clickable', true)
        .on('click', (e, d) => {
            for (let c of columns) {
                c.sorting = false
            }

            d.ascending = !d.ascending
            d.sorting = true

            sortTable()
        })

    header.selectAll('text')
        .data(columns)
        .join('text')
        .text(d => d.title)
        .attr('x', (d, i) => (i + 0.5) * columnWidth - xMargin / 2)
        .attr('y', 15)
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-family', 'Arial, Helvetica, sans-serif')

    // Render Frequency Scale
    const freqLegend = header.append('g')
        .attr('id', 'frequency-legend')
        .attr('transform', `translate(${columnWidth - xMargin / 2},${headerHeight})`)

    freqLegend.selectAll('text')
        .data(columns[1].domain)
        .join('text')
        .text(d => d)
        .attr('y', -7)
        .attr('x', d => scaleFrequency(d))
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Arial, Helvetica, sans-serif')
        .attr('font-size', '0.75rem')

    freqLegend.selectAll('line')
        .data(columns[1].domain)
        .join('line')
        .attr('y1', -5)
        .attr('x1', d => scaleFrequency(d))
        .attr('y2', 0)
        .attr('x2', d => scaleFrequency(d))
        .attr('stroke', 'black')

    // Render Percentage Scale
    const percLegend = header.append('g')
        .attr('id', 'perecentage-legend')
        .attr('transform', `translate(${2 * columnWidth - xMargin / 2}, ${headerHeight})`)

    percLegend.selectAll('text')
        .data(columns[2].domain)
        .join('text')
        .text(d => d < 0 ? -d : d)
        .attr('y', -7)
        .attr('x', d => scalePercentage(d))
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Arial, Helvetica, sans-serif')
        .attr('font-size', '0.75rem')

    percLegend.selectAll('line')
        .data(columns[2].domain)
        .join('line')
        .attr('y1', -5)
        .attr('x1', d => scalePercentage(d))
        .attr('y2', 0)
        .attr('x2', d => scalePercentage(d))
        .attr('stroke', 'black')

    // Render Content
    const content = svg.append('g')
        .attr('id', 'content')
        .attr('transform', `translate(${xMargin},${yMargin + headerHeight})`)

    const rows = content.append('g')
        .attr('id', 'rows')

    rows.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * rowHeight)
        .attr('width', '93%')
        .attr('height', rowHeight)
        .attr('fill', 'lightgray')
        .attr('opacity', (d, i) => i % 2 === 0 ? 0.125 : 0.25)

    // Render Phrase column
    const phrases = content.append('g')
        .attr('id', 'phrases')

    // Render Frequency column
    const frequency = content.append('g')
        .attr('id', 'frequency')
        .attr('transform', `translate(${columnWidth + xMargin / 2},${0})`)

    // Render Percentages column (Democrat)
    const percentageDem = content.append('g')
        .attr('id', 'dem-percentage')
        .attr('transform', `translate(${2 * columnWidth - xMargin / 2},${0})`)

    // Render Percentages column (Republican)
    const percentageRep = content.append('g')
        .attr('id', 'rep-percentage')
        .attr('transform', `translate(${2 * columnWidth - xMargin / 2},${0})`)

    // Render Total column
    const totals = content.append('g')
        .attr('id', 'totals')
        .attr('transform', `translate(${3.5 * columnWidth},${0})`)

    const updateTable = (in_data) => {
        data = [...in_data] // Clone data to avoid breaking simulation run

        svg.attr('height', (data.length + 1) * rowHeight + headerHeight)

        for (const d of data) {
            d.frequency = (parseFloat(d.percent_of_r_speeches) + parseFloat(d.percent_of_d_speeches)) / 2
            d.position = parseFloat(d.percent_of_r_speeches) - parseFloat(d.percent_of_d_speeches)
            d.percentage = parseFloat(d.percent_of_r_speeches) + parseFloat(d.percent_of_d_speeches)
        }

        phrases.selectAll('text')
            .data(data)
            .join('text')
            .text(d => d.phrase.charAt(0).toUpperCase() + d.phrase.slice(1))
            .attr('x', 5)
            .attr('y', (d, i) => i * 25 + 15)
            .attr('font-family', 'Arial, Helvetica, sans-serif')
            .attr('font-size', '0.75rem')

        frequency.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', 0)
            .attr('y', (d, i) => i * 25 + 1)
            .attr('width', d => scaleFrequency(Math.abs(d.position) * 0.01) - xMargin)
            .attr('height', 23)
            .attr('fill', d => props.scaleColor(d.category))

        percentageDem.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', d => scalePercentage(-Math.abs(d.percent_of_d_speeches)))
            .attr('y', (d, i) => i * 25 + 1)
            .attr('width', d => scalePercentage(Math.abs(d.percent_of_d_speeches)) - scalePercentage(0))
            .attr('height', 23)
            .attr('class', 'democrat')

        percentageRep.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', d => scalePercentage(0))
            .attr('y', (d, i) => i * 25 + 1)
            .attr('width', d => scalePercentage(d.percent_of_r_speeches) - scalePercentage(0))
            .attr('height', 23)
            .attr('class', 'republican')

        totals.selectAll('text')
            .data(data)
            .join('text')
            .text(d => d.total)
            .attr('x', 0)
            .attr('y', (d, i) => i * 25 + 15)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Arial, Helvetica, sans-serif')
            .attr('font-size', '0.75rem')
    }

    const sortTable = () => {
        const d = columns.filter((el => el.sorting))[0]

        data = data.sort((a, b) => {
            const as = d.alterFunc(a[d.sort])
            const bs = d.alterFunc(b[d.sort])
            return d.ascending ? d3.ascending(as, bs) : d3.descending(as, bs)
        })
        updateTable(data)
    }

    updateTable(data)

    return {
        update: updateTable
    }
}