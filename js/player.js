$(document).ready(function()
{
    initChart();
    var pingpongRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/");
    pingpongRef.on("value", handlePlayer);
});

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
        $("title").html(name);
        $("#player_name").html(name);
        $("#player_rank").html("N/A");
        $("#player_record").html("N/A");
        return;
    }

    $("title").html(player["name"]);
    $("#player_name").html(player["name"]);
    $("#player_rank").html(parseInt(player["rank"]));
    $("#player_record").html(player["wins"] + "-" + player["losses"]);

    var data = genPlayerData(player["history"]);
    genPlayerChart(data);
    //var ctx = document.getElementById("player_chart").getContext("2d");
    //var player_chart = new Chart(ctx).Line(data);

    genPlayerHistoryHtml(player["history"]);
}

function genPlayerChart(data)
{
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 700 - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;
    
    var x = d3.time.scale()
        .range([0, width]);
    
    var y = d3.scale.linear()
        .range([height, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(d3.time.week,2)
        .orient("bottom");
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
    var line = d3.svg.line()
        .x(function(d) { return x(new Date(d['x']*1000)); })
        .y(function(d) { return y(d['y']); });
    
    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(data, function(d) { return new Date(d['x']*1000); }));
    y.domain(d3.extent(data, function(d) { return d['y']; }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

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
}

function genPlayerHistoryHtml(history)
{
    $("#match_list").empty();
    for( var m=history.length-1; m>=0; m-- )
    {
        $("#match_list").append(genPlayerMatchHtml(history[m]));
    }
}

function genPlayerMatchHtml(playerMatch)
{
    html = "<li>";
    html += "<a href='player.html?n=" + playerMatch['versus'] + "'>";
    html += "<span class='date'>" + playerMatch['date'] + "</span>";
    html += "<span class='challenged'>" + (playerMatch['challenger'] ? "Challenged" : "Challenged by") + "</span>";
    html += "<span class='other_player'>" + playerMatch['versus'] + "</span>";
    html += "<span class='score'>" + playerMatch['score'] + "</span>";
    html += "</a>";
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
        data.push({'x':match['timestamp'], 'y':match['current_rank']});
    }

    return data;
}
