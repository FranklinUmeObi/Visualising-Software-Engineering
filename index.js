//URL Endpoints
let urlMyRepos = "https://api.github.com/users/franklinumeobi/repos";

main(urlMyRepos)



async function main(url1) 
{
    let myReposData = await GetRequest(url1).catch(error => console.error(error));
    console.log(myReposData);
}












//------------------------------------------------------------------------------
//Get My Repos
//------------------------------------------------------------------------------
async function GetRequest(url) {
  const response = await fetch(url);
  let data = await response.json();
  console.log("Get from "+ url + " is a "+response.status);
  return data;
}