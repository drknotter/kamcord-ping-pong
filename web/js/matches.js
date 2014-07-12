$(document).ready(function()
{
    var pingPongRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/");

    pingPongRef.on("value",genMatches);
});

function genMatches(snapshot)
{
    var matches = snapshot.val()["matches"];
    for( var m=0; m<matches.length; m++ )
    {
        // Determine the winner of this match.
        var sets = matches[m]["sets"];
        var w1=0, w2=0;
        for( var s=0; s<sets.length; s++ )
        {
            var scores = sets[s].split("-");
            if( parseInt(scores[0]) > parseInt(scores[1]) )
            {
                w1 += 1;
            }
            else if( parseInt(scores[1]) > parseInt(scores[0]) )
            {
                w2 += 1;
            }
        }
        var winner = (w1 > w2) ? 1 : ((w2 > w1) ? 2 : 0);

        $("#matches").append(genMatchHtml(matches[m], winner));
    }
}

function genMatchHtml(match, winner)
{
    var htmlString = "<li>";
    htmlString += "<span class='date'>" + match['date'] + "</span>";
    htmlString += "<a href='players/" + match['player1'] + ".html' class='" + (winner == 1 ? "winner" : (winner == 2 ) ? "loser" : "") + "'>";
    htmlString += "<span class='player1'>" + match['player1'] + "</span>";
    htmlString += "</a>";
    htmlString += "<span class='vs'>vs.</span>";
    htmlString += "<a href='players/" + match['player2'] + ".html' class='" + (winner == 2 ? "winner" : (winner == 1 ) ? "loser" : "") + "'>";
    htmlString += "<span class='player2'>" + match['player2'] + "</span>";
    htmlString += "</a>";
    htmlString += "<span class='sets'>";
    for( var s=0; s<match['sets'].length; s++ )
    {
        htmlString += "<span class='set'>" + match['sets'][s] + "</span>";
    }
    htmlString += "</span>";
    htmlString += "</li>";
    return htmlString;
}

