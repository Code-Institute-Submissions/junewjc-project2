/* global queue */
/* global d3 */
/* global dc */
/* global _ */

queue()

    .defer(d3.json, "data/suicide.json")
    .defer(d3.json, "data/countries.geo.json")
    .await(function(error, suicideData, countriesJson) {


        suicideData.forEach(function(d) {
            //To round off the value for no of suicides per 100k people
            d.suicides_100k = Math.round(d.suicides_100k);
        });

        data_cleaning_countries_name(suicideData, countriesJson);

        
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
