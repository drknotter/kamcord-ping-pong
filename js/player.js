$(document).ready(function()
{
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
