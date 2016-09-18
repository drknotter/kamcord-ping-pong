$(document).ready(function()
{
    initChart();
    var seasonName = getQueryParams(document.location.search).s;
    var pingPongRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/" + (seasonName ? "seasons/" + seasonName + "/" : ""));

    var name = getQueryParams(document.location.search).n;
    $("title").html(name);
    $("#player_name").html(name);
    $("#player_rank").html("&#183;&#183;&#183;");
    $("#player_record").html("&#183;&#183;&#183;");
    $("#player_doubles_rank").html("&#183;&#183;&#183;");
    $("#player_doubles_record").html("&#183;&#183;&#183;");
    $("#player_chart").hide();

    pingPongRef.on("value", handlePlayer);

    addSeasonQueryParams(seasonName);
});

function addSeasonQueryParams(seasonName) {
    if (seasonName) {
        $("a").each(function(index) {
            href=$(this).attr("href");
            $(this).attr("href", href + "?s=" + seasonName);
        })
    }
}

function handlePlayer(snapshot)
{
    var data = snapshot.val();
    var name = getQueryParams(document.location.search).n;
    var player = null;

    Elo.setPingPong(data);
    for( var p=0; p<PingPong.length; p++ )
    {
        if( PingPong[p]["name"] == name )
        {
            player = PingPong[p];
            break;
        }
    }

    if( player == null )
    {
        return;
    }

    $("title").html(player["name"]);
    $("#player_name").html(player["name"]);
    $("#player_rank").html(parseInt(player["rank"]));
    $("#player_record").html(player["wins"] + "-" + player["losses"]);
    $("#player_doubles_rank").html(parseInt(player["doubles-rank"]));
    $("#player_doubles_record").html(player["doubles-wins"] + "-" + player["doubles-losses"]);

    genPlayerHistoryHtml(player["history"]);
    genPlayerDoublesHistoryHtml(player["doubles-history"]);

    var data = genPlayerData(player["history"]);
    var doubles_data = genPlayerDoublesData(player["doubles-history"]);
    if( data.length > 1 || doubles_data.length > 1 )
    {
        $("#player_chart").show();
        genPlayerChart(data, doubles_data);
    }
}

function genPlayerChart(data, doubles_data)
{
    var margin = {top: 20, right: 20, bottom: 80, left: 50},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
    var x = d3.time.scale()
        .range([0, width]);
    
    var y = d3.scale.linear()
        .range([height, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(10,40,0)
        .orient("bottom");
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
    var line = d3.svg.line()
        .x(function(d) { return x(new Date(d['x'])); })
        .y(function(d) { return y(d['y']); })
        .interpolate('basis');
    
    var doubles_line = d3.svg.line()
        .x(function(d) { return x(new Date(d['x'])); })
        .y(function(d) { return y(d['y']); })
        .interpolate('basis');

    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var all_data = data.concat(doubles_data);
    var extent_x = d3.extent(all_data, function(d) { return d['x']; });
    var extent_y = d3.extent(all_data, function(d) { return d['y']; });

    x.domain([new Date(extent_x[0]),new Date(extent_x[1])]);
    y.domain(extent_y);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-45)" 
                });;

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    svg.selectAll("singles_circle")
        .data(data)
        .enter().append("svg:circle")
        .attr("class", "point singles")
        .attr("cx", function(d, i) { return x(new Date(d['x'])); })
        .attr("cy", function(d, i) { return y(d['y']); })
        .attr("r", function(d, i) { return 5; });

    svg.append("path")
        .datum(doubles_data)
        .attr("class", "doubles_line")
        .attr("d", doubles_line);

    svg.selectAll("doubles_circle")
        .data(doubles_data)
        .enter().append("svg:circle")
        .attr("class", "point doubles")
        .attr("cx", function(d, i) { return x(new Date(d['x'])); })
        .attr("cy", function(d, i) { return y(d['y']); })
        .attr("r", function(d, i) { return 5; });

    $('svg circle.singles').tipsy({ 
        gravity: 'sw', 
        html: true, 
        title: function() {
            var datum = this.__data__;
            var date = new Date(datum['x'])
            return date.toLocaleString() 
                    + '</br>Versus: ' + datum['o']
                    + '</br>Rank: ' + parseInt(datum['y']);
        }
    });
    $('svg circle.doubles').tipsy({ 
        gravity: 'sw', 
        html: true, 
        title: function() {
            var datum = this.__data__;
            var date = new Date(datum['x'])
            return date.toLocaleString() 
                    + '</br>With: ' + datum['w']
                    + '</br>Versus: ' + datum['o1'] + ' &amp; ' + datum['o2']
                    + '</br>Rank: ' + parseInt(datum['y']);
        }
    });
}

function genPlayerHistoryHtml(history)
{
    $("#match_list").empty();
    for( var m=history.length-1; m>=0; m-- )
    {
        $("#match_list").append(genPlayerMatchHtml(history[m]));
    }
}

function genPlayerDoublesHistoryHtml(history)
{
    $("#doubles_match_list").empty();
    for( var m=history.length-1; m>=0; m-- )
    {
        $("#doubles_match_list").append(genPlayerDoublesMatchHtml(history[m]));
    }
}

function genPlayerMatchHtml(playerMatch)
{
    var seasonName = getQueryParams(document.location.search).s;
    html = "<li>";
    html += "<a href='player.html?n=" + playerMatch['versus'] + (seasonName?"&s="+seasonName:"") + "'>";
    html += "<span class='date'>" + new Date(playerMatch['timestamp']).toLocaleDateString() + "</span>";
    html += "<span class='challenged'>" + (playerMatch['challenger'] ? "Challenged" : "Challenged by") + "</span>";
    html += "<span class='other_player'>" + playerMatch['versus'] + "</span>";
    html += "<span class='score " + (playerMatch['winner'] ? "winner" : "loser") + "'>" + (playerMatch['winner'] ? "&#8593;" : "&#8595;") + parseInt(Math.abs(playerMatch['scoreDiff'])) + "</span>";
    html += "</a>";
    html += "</li>";
    return html;
}

function genPlayerDoublesMatchHtml(playerMatch)
{
    var seasonName = getQueryParams(document.location.search).s;
    html = "<li>";
    html += "<span class='date'>" + new Date(playerMatch['timestamp']).toLocaleDateString() + "</span>";
    html += "<span class='with'>"
    html += "<a href='player.html?n=" + playerMatch['with'] + (seasonName?"&s="+seasonName:"") + "'>" + playerMatch['with'] + "</a>"
    html += "</span>";
    html += "<span class='challenged'>" + (playerMatch['challenger'] ? "Challenged" : "Challenged by") + "</span>";
    html += "<span class='versus'>"
    html += "<a href='player.html?n=" + playerMatch['versus1'] + (seasonName?"&s="+seasonName:"") + "'>" + playerMatch['versus1'] + "</a>"
    html += " &amp; "
    html += "<a href='player.html?n=" + playerMatch['versus2'] + (seasonName?"&s="+seasonName:"") + "'>" + playerMatch['versus2'] + "</a>"
    html += "</span>";
    html += "<span class='score " + (playerMatch['winner'] ? "winner" : "loser") + "'>" + (playerMatch['winner'] ? "&#8593;" : "&#8595;") + parseInt(Math.abs(playerMatch['scoreDiff'])) + "</span>";
    html += "</li>";
    return html;
}

function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

function initChart()
{
    $("#player_chart").prop("width", 700);
    $("#player_chart").prop("height", 400);
}

function genPlayerData(history)
{
    var data = [];
    for( var m=0; m<history.length; m++ ) 
    {
        var match = history[m];
        data.push({'x':match['timestamp'], 'y':match['current_rank'], 'o':match['versus']});
    }

    return data;
}

function genPlayerDoublesData(history)
{
    var data = [];
    for( var m=0; m<history.length; m++ ) 
    {
        var match = history[m];
        data.push({'x':match['timestamp'], 'y':match['current_rank'], 'w':match['with'], 'o1':match['versus1'], 'o2':match['versus2']});
    }

    return data;
}
