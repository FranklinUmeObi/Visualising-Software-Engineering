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
    console.log(num);
    console.log(myReposData);

    let commits = await commitsPerRepo(myReposData)
    console.log(commits); // array of objects {repoName, numCommits}

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