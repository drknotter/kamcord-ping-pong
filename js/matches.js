$(document).ready(function()
{
    var pingpongRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/");
    pingpongRef.child("matches").on("value", handleMatches);
});

function handleMatches(snapshot)
{
    var matches = snapshot.val();
    Elo.setMatchWinners(matches);
    genMatchesHtml(matches);
}

function genMatchesHtml(matches)
{
    $("#matches").empty();
    for( var m=0; m<matches.length; m++ )
    {
        $("#matches").append(genMatchHtml(matches[m]));
    }
}

function genMatchHtml(match)
{
    var winner = match["winner"];
    var htmlString = "<li>";
    htmlString += "<span class='date'>" + match['date'] + "</span>";
    htmlString += "<a href='player.html?n=" + match['player1'] + "' class='" + (winner == 1 ? "winner" : (winner == 2 ) ? "loser" : "") + "'>";
    htmlString += "<span class='player1'>" + match['player1'] + "</span>";
    htmlString += "</a>";
    htmlString += "<span class='vs'>vs.</span>";
    htmlString += "<a href='player.html?n=" + match['player2'] + "' class='" + (winner == 2 ? "winner" : (winner == 1 ) ? "loser" : "") + "'>";
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

