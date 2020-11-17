# Visualising-Software-Engineering
An Assignment graphing Github API data through the use of d3.js

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


## Appendix

![Social Graph](/assets/social%20graph2.png?raw=true "Contributers of the User MunGells repos")
