/** Class representing a Tree. */
class Tree {

  nodes = []
  /**
   * Creates a Tree Object
   * Populates a single attribute that contains a list (array) of Node objects to be used by the other functions in this class
   * @param {json[]} json - array of json objects with name and parent fields
   */
  constructor(json) {
    for (const el of json) {
      // Create node and add to nodes array
      this.nodes.push(new Node(el.name, el.parent))
    }
  }

  /**
   * Assign other required attributes for the nodes.
   */
  buildTree() {
    // note: in this function you will assign positions and levels by making calls to assignPosition() and assignLevel()
    for (const node of this.nodes) {
      const parent = this.nodes.filter(el => el.name === node.parentName)[0]

      if (parent) {
        node.parentNode = parent
        parent.addChild(node)
      }
    }

    this.assignLevel(this.nodes[0], 0)
    this.assignPosition(this.nodes[0], 0)
  }

  /**
   * Recursive function that assign levels to each node
   */
  assignLevel(node, level) {
    if (node.children.length > 0) {
      for (const child of node.children) { // recurse through child nodes
        this.assignLevel(child, level + 1)
      }
    }
    node.level = level
  }

  /**
   * Recursive function that assign positions to each node
   */
  assignPosition(node, position) {
    node.position = position

    if (node.children.length > 0) { // recurse through child nodes
      var idx = position
      for (const childNode of node.children) {
        idx = this.assignPosition(childNode, idx)
      }
      return idx // return highest index used by the children nodes
    } else {
      return position + 1 // at a leaf node, increment index
    }
  }

  /**
   * Function that renders the tree
   */
  renderTree() {
    const radius = 40
    const gridSize = {
      x: 150,
      y: 100
    }

    // Append svg
    const svg = d3.select('body')
      .append('svg')
      .attr('width', 1200)
      .attr('height', 1200)

    // Append lines
    svg.selectAll('line')
      .data(this.nodes)
      .enter()
      .append('line')
      .attr('x1', el => el.level * gridSize.x + radius)
      .attr('y1', el => el.position * gridSize.y + radius)
      .attr('x2', el => el.parentNode ? el.parentNode.level * gridSize.x + radius : el.level * gridSize.x + radius)
      .attr('y2', el => el.parentNode ? el.parentNode.position * gridSize.y + radius : el.position * gridSize.y + radius)

    // Append groups
    const groups = svg.selectAll('g')
      .data(this.nodes)
      .enter()
      .append('g')
      .classed('nodeGroup', true)
      .attr('transform', el => `translate(${el.level * gridSize.x + radius},${el.position * gridSize.y + radius})`)

    // Append circles
    groups.append('circle')
      .attr('r', radius)

    // Append text labels
    groups.append('text')
      .classed('label', true)
      .attr('y', 3)
      .text(el => el.name)
  }
}