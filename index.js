main()


//------------------------------------------------------------------------------
//Main
//------------------------------------------------------------------------------
async function main() 
{
    //URL Endpoints
    let urlMyRepos = "https://api.github.com/users/franklinumeobi/repos";
    let urlProject = "https://api.github.com/repos/facebook/react/contributors";

    //let myReposData = await GetRequest(urlMyRepos).catch(error => console.error(error));
    //let num = myReposData.length
    //console.log(num);
    //console.log(myReposData);


    //let commits = await commitsPerRepo(myReposData)
    //console.log(commits); // array of objects {repoName, numCommits}
    //D3_pieChartCommits(commits)


    let reactData = await GetRequest(urlProject).catch(error => console.error(error));
    let nodes = []
    let links = []
    socialGraphParse(reactData, nodes, links)
    D3_socialGraph(nodes, links)
}


//------------------------------------------------------------------------------
//Charts
//------------------------------------------------------------------------------
function D3_socialGraph(nodeData, linkData){
    //https://observablehq.com/@d3/force-directed-graph
}


function D3_pieChartCommits(myData) 
{
    //var data = [2, 4, 8, 10];
    var data = []
    myData.forEach(element => {
        data.push(element.commits)
    });

    var svg = d3.select(".chart1"),
        width = svg.attr("width"),
        height = svg.attr("height"),
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scaleOrdinal(['#008080','#00FFFF','#4682B4','#FFFFE0','#E6E6FA', 
    '#EE82EE','#9370DB','#4B0082','#ADFF2F','#00FF7F','#00BFFF','#4169E1','#BC8F8F','#191970']);

    // Generate the pie
    var pie = d3.pie();

    // Generate the arcs
    var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

    //Generate groups
    var arcs = g.selectAll("arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc")

    //Draw arc paths
    arcs.append("path")
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);

    
}





//------------------------------------------------------------------------------
//Data Parse Functions
//------------------------------------------------------------------------------
async function commitsPerRepo(userReposData)
{
    let commits = []
    for (let i = 0; i < userReposData.length; i++) 
    {
        const repo = userReposData[i].name
        let a = await GetRequest(`https://api.github.com/repos/franklinumeobi/${repo}/commits`).catch(error => console.error(error))
        let b = {"repo":repo, "commits":a.length}
        commits.push(b)
    }
    return commits
}

async function socialGraphParse(rawData, nodes, links)
{
    console.log(rawData);
    let arrPeople = [];
    for (let i = 0; i < rawData.length; i++) 
    {
        const element = rawData[i];
        let a = {"index":i, "username":element.login,"contributions":element.contributions, "followersUrl":element.followers_url}
        arrPeople.push(a)
    }
    console.log(arrPeople);

    let followers = await GetRequest(`${arrPeople[0].followersUrl}`).catch(error => console.error(error))
    console.log(followers);
    
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