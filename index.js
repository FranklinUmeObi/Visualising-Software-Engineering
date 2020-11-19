
function handleInput()
{
  var x = document.getElementById("textBox").value;
  main(x);
}

//------------------------------------------------------------------------------
//Get Request
//------------------------------------------------------------------------------
async function GetRequest(url) 
{
  const response = await fetch(url);
  let data = await response.json();
  return data;
}



//------------------------------------------------------------------------------
//Main
//------------------------------------------------------------------------------
async function main(user) {
  
  //URL Endpoints
  let url = `https://api.github.com/users/${user}/repos`;
  let reposData = await GetRequest(url).catch(error => console.error(error));
 
  //Social Graph
  socialGraphParse(reposData);
  //PieChart
  commitsPerRepo(reposData, user)
  //TreeMap
  usersLanguages(reposData, user)
}




//------------------------------------------------------------------------------
//Data Parse Functions
//------------------------------------------------------------------------------

async function commitsPerRepo(userReposData, user) {
  let commits = [];
  for (let i = 0; i < userReposData.length; i++) 
  {
    const repo = userReposData[i].name;
    let a = await GetRequest(`https://api.github.com/repos/${user}/${repo}/commits`).catch((error) => console.error(error));
    let b = { repo: repo, commits: a.length };
    commits.push(b);
  }
  D3_pieChartCommits(commits)
}

async function usersLanguages(userReposData, user) {
  let languages = new Set();
  let repoLangObj = []
  for (let i = 0; i < userReposData.length; i++) 
  {
    const repo = userReposData[i].name;
    let a = await GetRequest(`https://api.github.com/repos/${user}/${repo}/languages`).catch((error) => console.error(error));
    repoLangObj.push(a)
  }

  

  for (let i = 0; i < repoLangObj.length; i++) 
  {
    let keyArr = Object.keys(repoLangObj[i]);
      for (let j = 0; j < keyArr.length; j++) 
      {
        languages.add(keyArr[j])
      }
  }
  

  let langSize = new Map()
  for (let value of languages) langSize.set(value, 0);   // init map

 

  for (let i = 0; i < repoLangObj.length; i++) 
  {
    let obj = repoLangObj[i]
    for (const [key, value] of Object.entries(obj)) {

      let oldVal = langSize.get(key);
      let newVal = value + oldVal
      const newMap = langSize.set(key, newVal)
      langSize = newMap
    }

  }

  let children = []
  let values = []
  for (const [key, value] of langSize.entries()) 
  {
    let node = {
      "name":key,
      "group":"A",
      "value":value,
      "colname":"languages"
    }
    values.push(value)
    children.push(node)

  }
  let big = Math.max(...values)

  for (const e of children) {
    e.value = scale(e.value, 0, big, 1, 500)
  }

  D3_TreeMap(children);
}


async function socialGraphParse(rawData) {
  let arrRepos = [];
  let myNodes = []
  let myLinks = []

  for (let i = 0; i < rawData.length; i++) 
  {
    const element = rawData[i];
    let contributers = await GetRequest(`${element.contributors_url}`).catch((error) => console.error(error));
    let contributersName = [];
    if (contributers !== undefined) {
      for (let j = 0; j < contributers.length; j++) 
    {
      let name = contributers[j].login;
      contributersName.push(name);
    }
    let repo = { index: i, repo: element.name, contributers: contributersName };
    arrRepos.push(repo);
    }
  }

  for (let i = 0; i < arrRepos.length; i++) 
  {
    const repo = arrRepos[i];
    let node = { id: repo.repo, group: 1 }; //add repo node
    myNodes.push(node);
    for (let j = 0; j < repo.contributers.length; j++) 
    {
      const contrib = repo.contributers[j];
      let nodeC = { id: contrib, group: 2 }; //add contributer node
      if (!myNodes.filter((e) => e.id == contrib).length > 0) 
      {
        myNodes.push(nodeC);
      }
      let linkC = { source: contrib, target: repo.repo }; //value: 1 };
      myLinks.push(linkC);
    }
  }
  D3_socialGraph(myNodes, myLinks);
}






//------------------------------------------------------------------------------
//Charts
//------------------------------------------------------------------------------
function D3_socialGraph(nodeData, linkData) {
  var svg = d3.select(".chart2");
  svg.selectAll("*").remove()
  var width = svg.attr("width");
  var height = svg.attr("height");
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var graph = {
    nodes: nodeData,
    links: linkData,
  };

  var simulation = d3
    .forceSimulation(graph.nodes) // Force algorithm is applied to data.nodes
    .force(
      "link",
      d3.forceLink(graph.links).id(function (d) {
        return d.id;
      }) // This provide  the id of a node
    )
    .force("charge", d3.forceManyBody().strength(-5)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
    .force("center", d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
    .on("tick", ticked);

  // Initialize the links
  var link = svg
    .append("g")
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .style("stroke", "#aaa");

  // Initialize the nodes
  var node = svg
    .append("g")
    .selectAll("circle")
    .data(graph.nodes)
    //.data(data.nodes)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr('fill', function(d,i){
        return color(d.group);
   })
    .style("border", "#000");

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node
      .attr("cx", function (d) {
        return d.x + 3;
      })
      .attr("cy", function (d) {
        return d.y - 3;
      });
  }
}

function D3_pieChartCommits(myData) {
  var data = [];
  myData.forEach((element) => {
    data.push(element.commits);
  });

  var data2 = [];
  myData.forEach((element) => {
    data2.push(element.repo);
  });

  var svg = d3.select(".chart1"),
    width = svg.attr("width"),
    height = svg.attr("height"),
    radius = Math.min(width, height) / 2
    
    svg.selectAll("*").remove()
    
    g = svg
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var color = d3.scaleOrdinal([
    "#008080",
    "#00FFFF",
    "#4682B4",
    "#FFFFE0",
    "#E6E6FA",
    "#EE82EE",
    "#9370DB",
    "#4B0082",
    "#ADFF2F",
    "#00FF7F",
    "#00BFFF",
    "#4169E1",
    "#BC8F8F",
    "#191970",
  ]);

  // Generate the pie
  var pie = d3.pie()
  .sort(null); // Do not sort group by siz;

  // Generate the arcs
  var arc = d3.arc()
  .innerRadius(radius*0.6)
  .outerRadius(radius*0.9);

  var outerArc = d3.arc()
  .innerRadius(radius)
  .outerRadius(radius)

  //Generate groups
  var arcs = g
    .selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");

  //Draw arc paths
  arcs
    .append("path")
    .attr("fill", function (d, i) {
      return color(i);
    })
    .attr("d", arc);

    
// Add the polylines between chart and labels:
arcs
.selectAll('allPolylines')
.data(pie(data))
.enter()
.append('polyline')
  .attr("stroke", "black")
  .style("fill", "none")
  .attr("stroke-width", 1)
  .attr('points', function(d) {
    var posA = arc.centroid(d) // line insertion in the slice
    var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
    var posC = outerArc.centroid(d); // Label position = almost the same as posB
    var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
    posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
    return [posA, posB, posC]
  })

// Add the polylines between chart and labels:
arcs
.selectAll('allLabels')
.data(pie(data))
.enter()
.append('text')
  .text( function(d,i) { return data2[i] } )
  .attr('transform', function(d) 
  {
      var pos = outerArc.centroid(d);
      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
      pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
      return 'translate(' + pos + ')';
  })
  .style('text-anchor', function(d) {
      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
      return (midangle < Math.PI ? 'start' : 'end')
  })
}





function D3_TreeMap(childrenData){


  var svg = d3.select(".chart3");
  svg.selectAll("*").remove()
  var width = svg.attr("width");
  var height = svg.attr("height");
  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var data = {
    name: "Languages",
    children: childrenData
  };


  // Give the data to this cluster layout:
  var root = d3.hierarchy(data).sum(function(d){ return d.value}) // Here the size of each leave is given in the 'value' field in input data

  // Then d3.treemap computes the position of each element of the hierarchy
  d3.treemap()
    .size([width, height])
    .padding(2)
    (root)

  // use this information to add rectangles:
  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style("stroke", "black")
      .attr("fill", function (d, i) {
        return color(i);
      })
  // and to add the text labels
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
      .attr("y", function(d){ return d.y0+15})    // +20 to adjust position (lower)
      .text(function(d){ return d.data.name })
      .attr("font-size", "15px")
      .attr("fill", "black")
}


//Other Functions


const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}