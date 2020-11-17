
//let input = "facebook"
//let input = "franklinumeobi"
//let input = "MunGell"
//let input = "henrym2"

function handleInput()
{
  var x = document.getElementById("textBox").value;
  console.log(x);
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

  //PieChart -- Make this Treemap
  commitsPerRepo(reposData, user)
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


async function socialGraphParse(rawData) {
  let arrRepos = [];
  let myNodes = []
  let myLinks = []

  for (let i = 0; i < rawData.length; i++) 
  {
    const element = rawData[i];
    let contributers = await GetRequest(`${element.contributors_url}`).catch((error) => console.error(error));
    let contributersName = [];
    for (let j = 0; j < contributers.length; j++) 
    {
      let name = contributers[j].login;
      contributersName.push(name);
    }
    let repo = { index: i, repo: element.name, contributers: contributersName };
    arrRepos.push(repo);
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
  console.log("W");
}

function D3_pieChartCommits(myData) {
  var data = [];
  myData.forEach((element) => {
    data.push(element.commits);
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

