$(document).ready(function()
{
    var pingPongRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/");

    pingPongRef.on("value",genRankings);
});

function genRankings(snapshot)
{
    var players = snapshot.val()["initial"];

    var matches = snapshot.val()["matches"];
    for( var m=0; m<matches.length; m++ )
    {
        // Parse match information.
        var sets = matches[m]["sets"];
        var s1 = 0.0, s2=0.0, total=0.0, w1=0.0, w2=0.0;
        for( var s=0; s<sets.length; s++ )
        {
            scores = sets[s].split("-");
            var p1 = parseFloat(scores[0]);
            var p2 = parseFloat(scores[1]);
            s1 += p1;
            s2 += p2;
            if( p1 > p2 )
            {
                w1 += 1.0;
            }
            else if( p2 > p1 )
            {
                w2 += 1.0
            }
        }

        if( playerE)
    }
}

function playerExists(players, playerName)
{
    for( var p=0; p<players.length; p++ )
    {
        if( players[p]["name"] == playerName )
        {
            return true;
        }
    }
    return false;
}

function genRankHtml(player)
{
    var htmlString = "<li>"
    htmlString += "<a class='player' href='players/" + player['name'] + ".html'>"
    htmlString += "<span class='player_name'>" + player['name'] + "</span>"
    htmlString += "<span class='player_rank'>" + player['rank'].parseInt + "</span></a>"
    htmlString += "</li>"
}