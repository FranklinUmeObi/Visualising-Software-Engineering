//URL Endpoints
let urlMyRepos = "https://api.github.com/users/franklinumeobi/repos";


main(urlMyRepos)


//------------------------------------------------------------------------------
//Main
//------------------------------------------------------------------------------
async function main(url1) 
{
    //num repos
    let myReposData = await GetRequest(url1).catch(error => console.error(error));
    let num = myReposData.length
    //console.log(num);
    //console.log(myReposData);

    let commits = await commitsPerRepo(myReposData)
    //console.log(commits); // array of objects {repoName, numCommits}
    pieChartCommits(commits)
}



function pieChartCommits(myData) 
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

    var color = d3.scaleOrdinal(['#008080','#00FFFF','#4682B4','#FFFFE0','#E6E6FA', '#EE82EE','#9370DB','#4B0082','#ADFF2F','#00FF7F']);

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





//------------------------------------------------------------------------------
//Get Request
//------------------------------------------------------------------------------
async function GetRequest(url) {
  const response = await fetch(url);
  let data = await response.json();
  console.log("Get from "+ url + " is a "+response.status);
  return data;
}