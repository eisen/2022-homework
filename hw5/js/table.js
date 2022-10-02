/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData
        this.tableData = [...forecastData]
        // add useful attributes
        for (let forecast of this.tableData) {
            forecast.isForecast = true
            forecast.isExpanded = false
        }
        this.pollData = pollData
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'state'
            },
            {
                sorted: false,
                ascending: false,
                key: 'mean_netpartymargin',
                alterFunc: d => Math.abs(+d)
            },
            {
                sorted: false,
                ascending: false,
                key: 'winner_Rparty',
                alterFunc: d => +d
            },
        ]

        this.vizWidth = 300
        this.vizHeight = 30
        this.smallVizHeight = 20

        this.labels = [{
            value: '+75',
            party: 'biden'
        }, {
            value: '+50',
            party: 'biden'
        }, {
            value: '+25',
            party: 'biden'
        }, {
            value: '0',
            party: 'neutral'
        }, {
            value: '+25',
            party: 'trump'
        }, {
            value: '+50',
            party: 'trump'
        }, {
            value: '+75',
            party: 'trump'
        }]

        this.labelGap = this.vizWidth / 7.0

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth])

        this.attachSortHandlers()
        this.drawLegend()
    }

    drawLegend() {
        ////////////
        // PART 2 //
        ////////////
        /**
         * Draw the legend for the bar chart.
         */
        d3.select('#marginAxis')
            .attr('width', this.vizWidth)
            .attr('height', this.vizHeight)
            .selectAll('text')
            .data(this.labels)
            .join('text')
            .text(d => d.value)
            .attr('text-anchor', 'middle')
            .attr('width', this.labelGap)
            .attr('x', (d, i) => (i + 0.5) * this.labelGap)
            .attr('y', this.vizHeight - 10)
            .attr('class', d => d.party)
    }

    drawTable() {
        this.updateHeaders()
        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr')

        rowSelection.on('click', (event, d) => {
            if (d.isForecast) {
                this.toggleRow(d, this.tableData.indexOf(d))
            }
        })

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')
            .attr('class', d => d.class)



        ////////////
        // PART 1 // 
        ////////////
        /**
         * with the forecastSelection you need to set the text based on the dat value as long as the type is 'text'
         */
        let textSelection = forecastSelection.filter(d => d.type === 'text')
        textSelection.selectAll('text')
            .data(d => [d])
            .join('text')
            .text(d => d.value)

        let vizSelection = forecastSelection.filter(d => d.type === 'viz')

        let svgSelect = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', d => d.isForecast ? this.vizHeight : this.smallVizHeight)

        let grouperSelect = svgSelect.selectAll('g')
            .data(d => [d, d, d])
            .join('g')

        this.addGridlines(grouperSelect.filter((d, i) => i === 0), [-75, -50, -25, 0, 25, 50, 75])
        this.addRectangles(grouperSelect.filter((d, i) => i === 1))
        this.addCircles(grouperSelect.filter((d, i) => i === 2))
    }

    rowToCellDataTransform(d) {
        let stateInfo = {
            type: 'text',
            class: d.isForecast ? 'state-name' : 'poll-name',
            value: d.isForecast ? d.state : d.name
        }

        let marginInfo = {
            type: 'viz',
            value: {
                marginLow: -d.p90_netpartymargin,
                margin: d.isForecast ? -(+d.mean_netpartymargin) : d.margin,
                marginHigh: -d.p10_netpartymargin,
            }
        }

        let winChance
        if (d.isForecast) {
            const trumpWinChance = +d.winner_Rparty
            const bidenWinChance = +d.winner_Dparty

            const trumpWin = trumpWinChance > bidenWinChance
            const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance)
            let winOddsMessage = `${Math.floor(winOddsValue)} of 100`
            if (winOddsValue > 99.5 && winOddsValue !== 100) {
                winOddsMessage = '> ' + winOddsMessage
            }
            winChance = {
                type: 'text',
                class: trumpWin ? 'trump' : 'biden',
                value: winOddsMessage
            }
        }
        else {
            winChance = { type: 'text', class: '', value: '' }
        }

        let dataList = [stateInfo, marginInfo, winChance]
        for (let point of dataList) {
            point.isForecast = d.isForecast
        }
        return dataList
    }

    updateHeaders() {
        ////////////
        // PART 7 // 
        ////////////
        /**
         * update the column headers based on the sort state
         */


    }

    addGridlines(containerSelect, ticks) {
        ////////////
        // PART 3 // 
        ////////////
        /**
         * add gridlines to the vizualization
         */
        containerSelect.selectAll('line')
            .data(ticks)
            .join('line')
            .attr('transform', (d, i) => `translate(${(i + 0.5) * this.labelGap}, 0)`)
            .attr('x0', 0)
            .attr('x0', 0)
            .attr('y0', 0)
            .attr('y1', this.vizHeight)
            .attr('stroke', d => d === 0 ? 'black' : 'lightgray')
            .attr('stroke-width', d => d === 0 ? 2 : 1)
    }

    addRectangles(containerSelect) {
        ////////////
        // PART 4 // 
        ////////////
        /**
         * add rectangles for the bar charts
         */
        containerSelect.selectAll('rect')
            .data(d => {
                if (d.value.marginHigh <= 0) {
                    d.value.class = 'biden'
                    return [d.value]
                } else if (d.value.marginLow >= 0) {
                    d.value.class = 'trump'
                    return [d.value]
                } else {
                    const biden = { ...d.value }
                    const trump = { ...d.value }

                    biden.marginHigh = 0
                    biden.class = 'biden'

                    trump.marginLow = 0
                    trump.class = 'trump'

                    return [biden, trump]
                }
            })
            .join('rect')
            .attr('x', d => this.scaleX(d.marginLow))
            .attr('y', 5)
            .attr('width', d => this.scaleX(d.marginHigh) - this.scaleX(d.marginLow))
            .attr('height', this.smallVizHeight)
            .attr('fill', 'none')
            .attr('stroke', 'none')
            .attr('opacity', 0.5)
            .attr('class', d => d.class)
    }

    addCircles(containerSelect) {
        ////////////
        // PART 5 // 
        ////////////
        /**
         * add circles to the vizualizations
         */
        containerSelect.selectAll('circle')
            .data(d => [d.value])
            .join('circle')
            .attr('cx', d => this.scaleX(d.margin))
            .attr('cy', this.vizHeight * 0.5)
            .attr('r', 6)
            .attr('class', d => d.margin <= 0 ? 'biden' : 'trump')
            .attr('opacity', 0.75)
    }

    attachSortHandlers() {
        ////////////
        // PART 6 // 
        ////////////
        /**
         * Attach click handlers to all the th elements inside the columnHeaders row.
         * The handler should sort based on that column and alternate between ascending/descending.
         */
        d3.select('#columnHeaders')
            .selectAll('th')
            .on('click', el => {
                const sortBy = d3.select(el.target).attr('id')
                const headerState = this.headerData.filter(el => el.key === sortBy)[0]

                this.headerData.forEach(el => {
                    if (el.key !== sortBy) {
                        el.sorting = false
                    }
                })

                d3.select('#columnHeaders')
                    .selectAll('th')
                    .classed('sorting', false)

                d3.select(el.target)
                    .classed('sorting', true)

                if (headerState.sorted) {
                    headerState.ascending = !headerState.ascending
                } else {
                    headerState.sorted = true
                }

                this.tableData.sort((a,b) => headerState.ascending ? d3.ascending(a[sortBy], b[sortBy]) : d3.descending(a[sortBy], b[sortBy]) )
                this.drawTable()
            })

    }




    toggleRow(rowData, index) {
        ////////////
        // PART 8 // 
        ////////////
        /**
         * Update table data with the poll data and redraw the table.
         */

    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast)
    }

}
