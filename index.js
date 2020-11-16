//URL Endpoints
let urlMyRepos = "https://api.github.com/users/franklinumeobi/repos";

main(urlMyRepos)



async function main(url1) 
{
    let data = await GetMyRepos(url1).catch(error => console.error(error));
    console.log(data);
}












//------------------------------------------------------------------------------
//Get My Repos
//------------------------------------------------------------------------------
async function GetMyRepos(url) {
  const response = await fetch(url);
  let data = await response.json();
  console.log(response.status);
  return data;
}