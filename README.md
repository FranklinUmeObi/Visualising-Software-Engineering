# Visualising-Software-Engineering
An Assignment graphing Github API data through the use of d3.js

## Live Demonstartion
If you want to quickly test the visuailser visit:
[Frank's Visualiser](https://franklinumeobi.com/Projects/GithubMetricsVisualised/index.html)

## How to install and run
To run the project, you will need **Docker** installed.
1. Clone the code in this repo

2. Copy this code into your terminal
```docker build -t frank_visualiser .```

3. Copy this code into your terminal
```docker run -d -p 80:80 frank_visualiser```

4. open your localhost port 8080 eg ```localhost:8080```


## What the website consists of
Upen finishing the assignment, a user should be able to input a the name of a github user/company (eg. Me or facebook) and see some data about that user visualised in the carousel

### Social graph
The first slide is a social graph. The graph contains blue nodes which represent the repos belonging to the selected user. It also contains orange nodes which are the top 30 contributers in each of the repos. These orange nodes are then linked to all the repos that they have contributed to. The social graph is built as a force directed graph as shown below in the apendix.

### Pie Chart
The second slide is a pie chart. The pie chart visualises the number of repos a users has and how many commits were made in each repo. The purpose of this is to easily identify the big and small projeects as different repos have a different number of commits depending on its size or complexity.

### Tree Map
The last slide is a tree map. The tree map visualises the number of bytes of each language in a users repos. The purpose of this is to identify the main languages used by a user. The languages are mapped such that no language can be less than 1/500th the size of another, this was done to improve visualisation at the cost of a tiny amount of proportional accuracy in some edge cases such as my repos where javascript is exponentially bigger than some other languages such as dockerfile.


## Appendix

![Social Graph](/assets/social%20graph2.png?raw=true "Contributers of the User MunGells repos")
![Pie Chart](/assets/pie.PNG?raw=true "Commits in the repos of the User Branflake6 repos")
![Tree Map](/assets/treemap.PNG?raw=true "Languages used by the User Branflake6")
