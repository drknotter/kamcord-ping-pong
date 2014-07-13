$(document).ready(function()
{
    var pingPongRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/");
    pingPongRef.on("value",handleRankings);
});

function handleRankings(snapshot)
{
    var data = snapshot.val();
    Elo.setPingPong(data);
    genRankingsHtml(PingPong);
}

function genRankingsHtml(players)
{
    for( var p=0; p<players.length; p++ )
    {
        $("#rankings").append(genRankHtml(players[p]));
    }
}

function genRankHtml(player)
{
    var htmlString = "<li>";
    htmlString += "<a class='player' href='player.html?n=" + player['name'] + "'>";
    htmlString += "<span class='player_name'>" + player['name'] + "</span>";
    htmlString += "<span class='player_rank'>" + parseInt(player['rank']) + "</span></a>";
    htmlString += "</li>";
    return htmlString;
}