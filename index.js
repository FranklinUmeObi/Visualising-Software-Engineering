main();

//------------------------------------------------------------------------------
//Main
//------------------------------------------------------------------------------
async function main() {
  //URL Endpoints
  let urlMyRepos = "https://api.github.com/users/franklinumeobi/repos";
  let urlProject = "https://api.github.com/users/facebook/repos";

  let myReposData = await GetRequest(urlMyRepos).catch(error => console.error(error));
  let commits = await commitsPerRepo(myReposData)
  //console.log(commits); // array of objects {repoName, numCommits}
  D3_pieChartCommits(commits)

  let reactData = await GetRequest(urlProject).catch((error) =>
    console.error(error)
  );
  let nodes = [];
  let links = [];
  socialGraphParse(reactData, nodes, links);
  console.log(nodes);
  console.log(links);

  //D3_socialGraph(nodes, links);
}

//------------------------------------------------------------------------------
//Charts
//------------------------------------------------------------------------------
function D3_socialGraph(nodeData, linkData) {
  var svg = d3.select(".chart2");
  var width = svg.attr("width");
  var height = svg.attr("height");

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
    .style("fill", "#fff")
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
        return d.x + 6;
      })
      .attr("cy", function (d) {
        return d.y - 6;
      });
  }
  console.log("W");
}

function D3_pieChartCommits(myData) {
  //var data = [2, 4, 8, 10];
  var data = [];
  myData.forEach((element) => {
    data.push(element.commits);
  });

  var svg = d3.select(".chart1"),
    width = svg.attr("width"),
    height = svg.attr("height"),
    radius = Math.min(width, height) / 2,
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
  var pie = d3.pie();

  // Generate the arcs
  var arc = d3.arc().innerRadius(0).outerRadius(radius);

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
}

//------------------------------------------------------------------------------
//Data Parse Functions
//------------------------------------------------------------------------------
async function commitsPerRepo(userReposData) {
  let commits = [];
  for (let i = 0; i < userReposData.length; i++) {
    const repo = userReposData[i].name;
    let a = await GetRequest(
      `https://api.github.com/repos/franklinumeobi/${repo}/commits`
    ).catch((error) => console.error(error));
    let b = { repo: repo, commits: a.length };
    commits.push(b);
  }
  return commits;
}

async function socialGraphParse(rawData, myNodes, myLinks) {
  //console.log(rawData);
  let arrRepos = [];
  for (let i = 0; i < rawData.length; i++) {
    const element = rawData[i];
    let contributers = await GetRequest(
      `${element.contributors_url}`
    ).catch((error) => console.error(error));
    let contributersName = [];
    for (let j = 0; j < contributers.length; j++) {
      let name = contributers[j].login;
      contributersName.push(name);
    }
    let repo = { index: i, repo: element.name, contributers: contributersName };
    arrRepos.push(repo);
  }
  //console.log(arrRepos);//array of repos and their contributers

  for (let i = 0; i < arrRepos.length; i++) {
    const repo = arrRepos[i];
    let node = { id: repo.repo, group: 1 }; //add repo node
    myNodes.push(node);
    for (let j = 0; j < repo.contributers.length; j++) {
      const contrib = repo.contributers[j];
      let nodeC = { id: contrib, group: 2 }; //add contributer node
      if (!myNodes.filter((e) => e.id == contrib).length > 0) {
        myNodes.push(nodeC);
      }
      let linkC = { source: contrib, target: repo.repo }; //value: 1 };
      myLinks.push(linkC);
    }
  }

  nodes = myNodes;
  links = myLinks;
  D3_socialGraph(myNodes, myLinks);
}

//------------------------------------------------------------------------------
//Get Request
//------------------------------------------------------------------------------
async function GetRequest(url) {
  const response = await fetch(url);
  let data = await response.json();
  //console.log("Get from "+ url + " is a "+response.status);
  return data;
}

//Failed social graph
/*
function D3_socialGraph(nodeData, linkData) {
  //chart = {
  const links = linkData.map((d) => Object.create(d));
  const nodes = nodeData.map((d) => Object.create(d));
  height = 400;
  width = 700;

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  var svg = d3.select(".chart2").attr("viewBox", [0, 0, width, height]);

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
   // .join("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value));

  const node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
   // .join("circle")
    .attr("r", 5)
    .attr("fill", color())
    .call(drag(simulation));

  node.append("title").text((d) => d.id);

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  //invalidation.then(() => simulation.stop());

  return svg.node();
  //}
}
function color() {
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return (d) => scale(d.group);
}
function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}


*/
