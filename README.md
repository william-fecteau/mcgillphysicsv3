# Mcgill physics v3

## Inspiration
So, the morning before the hackathon start, one of the team member pulled a meal out of the oven. Before putting it on the glass table, he carefully places a kitchen glove underneath, fearing that the heat transfer would break it. And that's basically it! We figured we would build a heat diffusion simulation

## What it does
It is a heat diffusion simulation including a simulation of fissure on heat distortion. The user can play around with the heat sources and some parameters such as materials, heat source temperature, starting environment, etc.

The choice of the heat source, temperature and material can induce cracks in the board, and those cracks are able to propagate themselves

## How to run it
You can visit the site [here](http://amoghot.stwong.me/) or simply clone the repo and double-click on the ```index.html``` file

## How we built it
**Development side**: We built a static site in pure javascript with three.js for the visualization of the simulation. The site is served through an nginx server

**Physics side**: We did a modelization of the diffusion equation and then we implemented a cracking system based on thermal shock. Its explained in details [here](https://www.overleaf.com/read/wnmprkqngszc)

## Challenges we ran into
**Development side**: A lot of subtile coordinate transformations were necessary to go from screen space to container space to matrix indices and it was very easy to mess up those and get an inverted image or some weird visual bugs

**Physics side**: The generation of crack was very complicated to implement. We needed to fully understand the physics of the cracking of various materials and the thermal shock concept. Also, for the propagation of these cracks, we needed to create a simple pathfinding algorithm that was not so easy to implement

## Accomplishments that we're proud of

**Development side**: The UI has a lot of cool small features like dragging heat sources, dragging weaknesses and causing cracks to propagate at will

**Physics side**: We are very proud to have a very precise model of the diffusion equation. In fact, the simulation of the heat propagation takes in many parameters that allows it to be a very viable replica of what would happen in the real world. Also, the implementation of cracks was very painful, but we were very proud to achieve this goal.

## What we learned

**Development side**: We learned more about data visualization and coordinate changes necessary to communicate between multiple reference frame.

**Physics side**: We learned a lot more on the diffusion equation and the numerical methods to solve these types of equation. Also, with all the reading that we did on material science, we understand a lot more about the failing of some materials, mainly the cracking generation process.
