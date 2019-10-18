/* global queue */
/* global d3 */
/* global dc */
/* global _ */
/* global crossfilter */

queue()

    .defer(d3.json, "data/suicide.json")
    .defer(d3.json, "data/countries.geo.json")
    .await(function(error, suicideData, countriesJson) {


        suicideData.forEach(function(d) {
            //To round off the value for no of suicides per 100k people
            d.suicides_100k = Math.round(d.suicides_100k);
        });

        data_cleaning_countries_name(suicideData, countriesJson);

        let ndx = crossfilter(suicideData);
        let all_dim = ndx.dimension(function(d) { return d; });

        show_year_selector(ndx);
        show_total_no_of_suicides(ndx);
        show_no_of_suicides_by_gender(ndx);
        show_countries_with_highest_suicide(ndx);
        show_no_of_suicides_by_age_group(ndx);

        //To parse the dataset's year value into date format
        let parse_date = d3.time.format("%Y").parse;
        suicideData.forEach(function(d) {
            d.year = parse_date("" + d.year);
        });

        show_no_of_suicides_by_year(ndx);
        show_country_map(ndx, countriesJson);

        dc.renderAll();
    });



//Data cleaning for the slight discrepancy of the county names in both dataset (e.g. Russia vs Russian Federation)
function data_cleaning_countries_name(suicideData, countriesJson) {
    let all_countries_in_cjson = _.uniqBy(countriesJson.features, 'properties.name');
    for (let c of all_countries_in_cjson) {
        let currentCjsonCountry = c.properties.name;
        let entry = _.filter(suicideData, function(d) {

            if (d.country.indexOf(currentCjsonCountry) != -1) {
                d.country = currentCjsonCountry;
            }
        });
    }

    let all_countries_in_sjson = _.uniqBy(suicideData, 'country');
    for (let i of all_countries_in_sjson) {
        let currentSjsonCountry = i.country;
        let entry = _.filter(countriesJson.features, function(d) {

            if (d.properties.name.indexOf(currentSjsonCountry) != -1) {
                d.properties.name = currentSjsonCountry;
            }
        });
    }
}

//Drop down menu to let user select a specific year
function show_year_selector(ndx) {
    let year_dim = ndx.dimension(dc.pluck('year'));
    let year_group = year_dim.group();

    dc.selectMenu("#year-selector")
        .dimension(year_dim)
        .group(year_group)
        .promptText('All Years')
        .title(function(d) {
            return 'Year: ' + d.key;
        });
}


//To show the total number of suicides
function show_total_no_of_suicides(ndx) {
    let total_no_of_suicides = ndx.groupAll().reduceSum(dc.pluck('suicides_100k'));

    dc.numberDisplay("#suicides-figure")
        .group(total_no_of_suicides)
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d) {
            return d;
        });
}


//Pie chart to show the percentage and the no of suicides for each gender
function show_no_of_suicides_by_gender(ndx) {
    //Data dimension for gender
    let gender_dim = ndx.dimension(dc.pluck('sex'));
    //Data group for no of suicides per 100k people for each gender
    let total_suicides_each_gender = gender_dim.group().reduceSum(dc.pluck('suicides_100k'));

    dc.pieChart('#pie-chart')
        .height(300)
        .radius(300)
        .transitionDuration(1500)
        .dimension(gender_dim)
        .group(total_suicides_each_gender)
        .ordinalColors(['#67a9cf', '#fa9fb5'])
        .useViewBoxResizing(true)
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(function(d) {
                return d.data.key.charAt(0).toUpperCase() + d.data.key.substring(1) + ': ' + d.data.value + ' (' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) + '%)';
            });
        });
}


//Row chart to show the top 10 countries with the highest suicide rate
function show_countries_with_highest_suicide(ndx) {
    //Data dimension for country
    let country_dim = ndx.dimension(dc.pluck('country'));
    //Data group for no of suicides per 100k people for each country
    let total_suicide_by_country = country_dim.group().reduceSum(dc.pluck('suicides_100k'));
    //To set the number of countries in the chart
    let top_countries = 10;

    dc.rowChart("#row-chart")
        .width(300)
        .height(450)
        .margins({ top: 20, left: 10, right: 10, bottom: 20 })
        .transitionDuration(750)
        .dimension(country_dim)
        .group(total_suicide_by_country)
        .data(function(d) { return d.top(top_countries); })
        .ordinalColors(["#084099","#084080", "#0868af","#0868aa", "#2b8cbf","#2b8cba", "#4eb3d3","#4eb3d3", "#7bccc4", "#a8ddb5"])
        .renderLabel(true)
        .gap(1)
        .title(function(d) { return "No. of suicides: " + d.value; })
        .elasticX(true)
        .useViewBoxResizing(true)
        .xAxis().ticks(10).tickFormat(d3.format("s"));
}


//Stacked bar chart to show the no of suicides(y-axis) in each age group(x-axis), categorized by gender(stacked)
function show_no_of_suicides_by_age_group(ndx) {
    //Data dimension for age group
    let age_dim = ndx.dimension(dc.pluck('age'));

    //Data group for no of suicides per 100k people for each age group, categorized by gender
    let male_suicides_per_age_group = age_dim.group().reduceSum(function(d) {
        if (d.sex == "male") {
            return d.suicides_100k;
        }
        else {
            return 0;
        }
    });

    let female_suicides_per_age_group = age_dim.group().reduceSum(function(d) {
        if (d.sex == "female") {
            return d.suicides_100k;
        }
        else {
            return 0;
        }
    });

    dc.barChart("#bar-chart")
        .width(500)
        .height(350)
        .margins({ top: 30, right: 50, bottom: 40, left: 50 })
        .dimension(age_dim)
        .group(female_suicides_per_age_group, "Female")
        .stack(male_suicides_per_age_group, "Male")
        .ordinalColors(['#fa9fb5', '#67a9cf'])
        .elasticY(true)
        .useViewBoxResizing(true)
        .title(function(d) { return "Age Group: " + d.key + "\n No. of suicides: " + d.value; })
        .x(d3.scale.ordinal())
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(100).y(20).itemHeight(13).gap(5))
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Age Group")
        .yAxisLabel("No. of Suicides per 100k people")
        .yAxis().ticks(10);
}


//Stacked line chart to show the no of suicides(y-axis) for each year(x-axis), categorized by gender(stacked)
function show_no_of_suicides_by_year(ndx) {
    //Data dimension for year
    let year_dim = ndx.dimension(function(d) {
        return new Date(d.year);
    });

    //Data group for no of suicides per 100k people for each gender
    let male_suicides_per_year = year_dim.group().reduceSum(function(d) {
        if (d.sex == "male") {
            return d.suicides_100k;
        }
        else {
            return 0;
        }
    });

    let female_suicides_per_year = year_dim.group().reduceSum(function(d) {
        if (d.sex == "female") {
            return d.suicides_100k;
        }
        else {
            return 0;
        }
    });

    //Setting min and max year for x-axis
    let min_year = year_dim.bottom(1)[0].year;
    let max_year = year_dim.top(1)[0].year;

    dc.lineChart("#line-chart")
        .renderArea(true)
        .width(500)
        .height(350)
        .transitionDuration(1000)
        .margins({ top: 30, right: 50, bottom: 40, left: 50 })
        .dimension(year_dim)
        .group(female_suicides_per_year, "Female")
        .stack(male_suicides_per_year, "Male")
        .ordinalColors(['#fa9fb5', '#67a9cf'])
        .elasticY(true)
        .transitionDuration(500)
        .x(d3.time.scale().domain([min_year, max_year]))
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .useViewBoxResizing(true)
        .title(function(d) { return "Year " + d.key.getFullYear() + "\n No. of suicides: " + d.value; })
        .legend(dc.legend().x(400).y(30).itemHeight(13).gap(5))
        .brushOn(false)
        .xAxisLabel("Year")
        .yAxisLabel("No. of Suicides per 100k people")
        .yAxis().ticks(10);
}


// Choropleth chart to show the number of suicides for each country
function show_country_map(ndx, countriesJson) {

    //Data dimension for country
    let country_dim = ndx.dimension(dc.pluck('country'));
    
    //Data group for no of suicides per 100k people for each country
    let total_suicide_by_country = country_dim.group().reduceSum(dc.pluck('suicides_100k'));

    dc.geoChoroplethChart("#map-chart")
        .width(1000)
        .height(480)
        .dimension(country_dim)
        .group(total_suicide_by_country)
        .colors(["#f0f9e8", "#ccebc5", "#a8ddb5", "#7bccc4", "#43a2ca", "#0868ac"])
        .colorAccessor(function(d) { return d; })
        .colorDomain([1, 6000])
        .overlayGeoJson(countriesJson["features"], "country", function(d) {
            return d.properties.name;
        })
        .projection(d3.geo.mercator()
            .center([10, 40])
            .scale(110))
        .useViewBoxResizing(true)
        .title(function(d) {
            if (d.value == undefined) {
                return "Country: " + d.key +
                    "\n" +
                    "Data Unavailable";
            }
            else {
                return "Country: " + d.key +
                    "\n" +
                    "Total Suicides: " + d.value;
            }
        });
}
