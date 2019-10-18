# Data Visualisation Dashboard
Project 2: Interactive Frontend Development Milestone Project - Code Institute


## Introduction

My project is to make an interactive data dashboard for the dataset obtained from [Kaggle](https://www.kaggle.com/russellyates88/suicide-rates-overview-1985-to-2016). 

The dataset contains information on suicide rates worldwide between year 1985 to 2016. 

The purpose of my project is to analyse the information in the dataset by creating charts which help to detect patterns or trends on suicides.

## Demo
The deployed version of the interactive data dashboard can be found at https://junewjc.github.io/project2/

## UX
When designing the dashboard, my main focus is to make it minimalist so that the users are drawn to and more likely to interact with the charts. 
Words are kept to a minimum so that users can come up with their own conclusions.

A mockup of the dashboard can be found [here](https://docs.google.com/presentation/d/1JkzWB3lGG3W0qBpczt9hqzK_mS_L9H7YjepbLHCd3Ts/edit?usp=sharing).

### User Stories
- I want the charts to be easy to read and analyse 
- I want to be able to interact with the charts and draw conclusions based on the interactions
- I want to be able to reset the charts easily

### Features
#### Existing Features
- Select Menu - to allow users to select and display charts for a specific year
- Reset Button - to allow users to reset all the charts after interacting with them
- Number Display - to show the total number of suicides based on the interaction with the charts
- Pie Chart - to show the gender ratio of the dataset
- Row Chart - to show the top 10 countries with the highest suicide rate
- Bar Chart - to show the correlation of suicide rate against the age group
- Line Chart - to show the pattern of suicide rate across the years
- World Map - to show the suicide rates of individual countries. The world map will be hidden when on mobile view. This is because the world map could not be zoomed  and hence the map will be too small to be viewed on mobile.

#### Features Left to Implement
In the future, I would like to add a pan and zoom function for the world map as currently the map is too small to be viewed on mobile. 

## Technologies Used
HTML

CSS 

Javascript

[Bootstrap (3.3.7)](https://getbootstrap.com/)

[JQuery] (https://jquery.com/)

[D3.js] (https://d3js.org/)

[Dc.js] (https://dc-js.github.io/dc.js/)

[Crossfilter.js] (https://square.github.io/crossfilter/)

[Queue.js] (https://github.com/d3/d3-queue)

[Lodash.js] (https://lodash.com/)


## Testing
As the project is an interactive data dashboard, the testings are mostly to check the responsiveness of the charts. 

Testings are also done to make sure the dashboard is mobile responsive. 

The dashboard was manually tested using Chrome, Firefox or Safari developer tools. 


## Deployment
The project was written on AWS Cloud9 and was saved and tested locally. 

The website  was hosted through GitHub Pages and is deployed from the master branch so that it can be updated through new commits to the master branch. 

Regular commits were performed and pushed to GitHub which allows ease of tracking for any changes to the codes. 


## Credits

### Acknowledgements
The dataset used for this project was obtained from https://www.kaggle.com/russellyates88/suicide-rates-overview-1985-to-2016

The colours used for the world map was obtained from http://colorbrewer2.org

The inspiration of this project was from http://adilmoujahid.com/posts/2015/01/interactive-data-visualization-d3-dc-python-mongodb/
