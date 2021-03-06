var width = 900;
var height = 700;

var graphics = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

d3.json("data/europe.json", loadData);

function loadData(error, dataset) {
    if (error) {
        console.log(error);
    }
    else {
        drawData(dataset);
    }
}
/*var mapProjection = d3.geo.albers()
 .center ([25, 54])
 .rotate([0, 0]);
 */
var mapProjection = d3.geo.albers()
    .center([2, 56])
    .rotate([0, 0, 0])
    .scale(4000);

function drawData(dataset) {
         console.log(dataset);
    var countries = topojson.feature(dataset,
        dataset.objects.countries).features;
    var subunits = topojson.feature(dataset, dataset.objects.subunits)
        .features;
    var ukSubunits = subunits.filter(function(subunit) {
        return subunit.properties.part_of == "GBR"
    });

    var geoPath = d3.geo.path()
        .projection(mapProjection);

    var color = d3.scale.ordinal()
        .domain(["ENG", "SCT", "WLS", "NIR"])
        .range([
            "#c6dbef", "#9ecae1", "#6baed6", "#4292c6",
            "#2171b5", "#08519c", "#08306b"
        ]);

    graphics.selectAll("path")
        /*.data(countries)
        .enter()
        .append("path")
        .attr("class", function(data){
            console.log(dataset);
        })
        .attr("d", geoPath)
        .style("fill", function(country) {
        return color(country.id);
        */
        .data(ukSubunits)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .style("fill", function(subunit) {
            return color(subunit.id);
    });

    d3.json("data/usersGraph.json", loadUserData);
}

function loadUserData(error, dataset){
    if (error) {
        console.log(error);
    }
    else
    {
        for (var i = 0; i < dataset.nodes.length; i++) {
            var user = dataset.nodes[i];
            var coordinates = [d3.mean(user.tweets, getLongitude),
            d3.mean(user.tweets, getLatitude)];
            user.geo = coordinates;
        drawUserData(dataset);
    }
}

function drawUserData(dataset) {
    console.log(dataset);
    var coord = mapProjection([0.1275, 51.5072]);
    graphics.append("circle")
        .attr("r", 3)
        // .attr("cx", coord[0])
        // .attr("cy", coord[1]);
        .attr("transform", "translate(" + mapProjection([0.1275, 51.5072]) + ")");
}
    graphics.selectAll(".tweet")
        .data(dataset.nodes)
        .enter()
        .append("circle")
        .attr("class", "tweet")
        .attr("r", 2.5)
        .style("fill", "#800014")
        .attr("transform", function(user){
            var longitude=user.tweets[0].geo.coordinates[1];
            var latitude= user.tweets[0].geo.coordinates[0];
            var coordinates = [longitude, latitude];
            return "translate("+mapProjection(coordinates)+")";
        })
        .style("opacity", 0.4);


    graphics.selectAll(".link")
        .data(dataset.links)
        .enter()
        .append("line")
        .style("stroke", "#999")
        .style("opacity", 0.2)
        .attr("x1", function(d) {
            return mapProjection(dataset.nodes[d.source].geo)[0];
        })
        .attr("y1", function(d) {
            return mapProjection(dataset.nodes[d.source].geo)[1]
        })
        .attr("x2", function(d) {
            return mapProjection(dataset.nodes[d.target].geo)[0]
        })
        .attr("y2", function(d) {
            return mapProjection(dataset.nodes[d.target].geo)[1]
        });
}
function getLongitude(tweet) {
    return tweet.geo.coordinates[1];
}
function getLatitude(tweet) {
    return tweet.geo.coordinates[0];
}