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

    genPlayerHistoryHtml(player["history"]);

    var data = genPlayerData(player["history"]);
    var ctx = document.getElementById("player_chart").getContext("2d");
    var player_chart = new Chart(ctx).Line(data);
}

function genPlayerHistoryHtml(history)
{
    $("#match_list").empty();
    for( var m=0; m<history.length; m++ )
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
    var maxes = {};
    for( var m=0; m<history.length; m++ ) 
    {
        var match = history[m];
        if( !(match['date'] in maxes) )
        {
            maxes[match['date']] = match['current_rank'];
        }
        else if( maxes[match['date']] < match['current_rank'] )
        {
            maxes[match['date']] = match['current_rank'];
        }
    }

    var data = {};
    data['labels'] = [];
    data['datasets'] = [{'data':[],'fillColor':"rgba(0,0,0,0)",'strokeColor':"black",'pointColor':"black"}];
    for( var date in maxes )
    {
        data['labels'].push(date);
        data['datasets'][0]['data'].push(Math.round(maxes[date]));
    }

    return data;
}
