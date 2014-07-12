$(document).ready(function()
{
    var pingPongRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/");

    pingPongRef.on("value",genRankings);
});

function genRankings(snapshot)
{
    var matches = snapshot.val()["matches"];
    for( var i=0; i<matches.length; i++ )
    {
        
    }
}