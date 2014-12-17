var show_inactive = false;

$(document).ready(function()
{
    var pingPongRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/");
    pingPongRef.on("value",handleRankings);

    initClickHandlers();
    initNewMatchDialog();
    setShowHideInactive();
});

function handleRankings(snapshot)
{
    var data = snapshot.val();
    Elo.setPingPong(data);
    genRankingsHtml(PingPong);
}

function genRankingsHtml(players)
{
    $("#rankings").empty();
    for( var p=0; p<players.length; p++ )
    {
        if( !players[p]['inactive'] || show_inactive )
        {
            $("#rankings").append(genRankHtml(players[p]));
        }
    }
}

function genRankHtml(player)
{
    var htmlString = "<li>";
    htmlString += "<a class='player' href='player.html?n=" + player['name'] + "'>";
    htmlString += "<span class='player_name'>" + player['name'] + "</span>";
    htmlString += "<span class='player_rank'>" + parseInt(player['rank']) + "</span>";
    if( player['inactive'] )
    {
        htmlString += "<div class='player_inactive'>INACTIVE</div>";
    }
    htmlString += "</a>";
    htmlString += "</li>";
    return htmlString;
}

function initClickHandlers()
{
    $("#new").on("click", function()
    {
        initNewMatchDialog();
        $("body").scrollTop(0);
        $("#new_match_background").fadeIn(200);
    });
    $("#hidden").on("click", function()
    {
        show_inactive = !show_inactive;
        genRankingsHtml(PingPong);
        setShowHideInactive();
    });

    $("#add_set").on("click", function()
    {
        $("#sets_input").append(genMatchHtml());
    });
    $("#close_new_match,#cancel").on("click", function()
    {
        $("#new_match_background").fadeOut(200);
    });
}

function setShowHideInactive()
{
    if( show_inactive )
    {
        $("#hidden").text("Hide Inactive");
    }
    else
    {
        $("#hidden").text("Show Inactive");
    }
}

function initNewMatchDialog()
{
    $("#sets_input").empty();
    $("#sets_input").append(genMatchHtml());
}


function genMatchHtml()
{
    var htmlString = "<li>";
    htmlString += "<input class='score player1' /> - <input class='score player2' />"
    htmlString += "</li>";
    return htmlString;
}
