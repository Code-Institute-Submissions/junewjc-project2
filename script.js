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
        show_total_no_of_suicides(ndx)
        show_no_of_suicides_by_gender(ndx)
        show_countries_with_highest_suicide(ndx)

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
        .renderLabel(true)
        .gap(1)
        .title(function(d) { return "No. of suicides: " + d.value; })
        .elasticX(true)
        .useViewBoxResizing(true)
        .xAxis().ticks(10).tickFormat(d3.format("s"));
}