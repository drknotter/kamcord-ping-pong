var show_inactive = false;
var sort_by_doubles = true;

$(document).ready(function()
{
    var seasonId = getQueryParams(document.location.search).s;
    var pingPongRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/" + (seasonId ? "seasons/" + seasonId + "/" : ""));
    pingPongRef.on("value", handleRankings);

    addSeasonQueryParams(seasonId);
    initClickHandlers();
    setShowHideInactive();
});

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

function addSeasonQueryParams(seasonId) {
    if (seasonId) {
        $("a").each(function(index) {
            href=$(this).attr("href");
            $(this).attr("href", href + "?s=" + seasonId);
        })
    }
}

function handleRankings(snapshot)
{
    var data = snapshot.val();
    Elo.setPingPong(data);
    sortPingPong();
    genRankingsHtml(PingPong);

    if (data['seasonName']) {
        $("#season").text(data['seasonName'])
    } else {
        $("#season").remove();
    }
}

function sortPingPong() {
    if (sort_by_doubles) {
        PingPong.sort(function(a,b){return b['doubles-rank']-a['doubles-rank']});
    } else {
        PingPong.sort(function(a,b){return b['rank']-a['rank']});
    }
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

    $("#doubles_rank_header").css("text-decoration", sort_by_doubles ? "underline" : "none");
    $("#singles_rank_header").css("text-decoration", sort_by_doubles ? "none" : "underline");
}

function genRankHtml(player)
{
    var seasonId = getQueryParams(document.location.search).s;
    var htmlString = "<li>";
    htmlString += "<a class='player' href='player.html?n=" + player['name'] + (seasonId?"&s="+seasonId:"") + "'>";
    htmlString += "<span class='player_name'>" + player['name'] + "</span>";
    htmlString += "<span class='player_rank'>" + parseInt(player['rank']) + "</span>";
    htmlString += "<span class='player_rank'>" + parseInt(player['doubles-rank']) + "</span>";
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
    $("#hidden").on("click", function()
    {
        show_inactive = !show_inactive;
        genRankingsHtml(PingPong);
        setShowHideInactive();
    });

    $("#singles_rank_header").on("click", function()
    {
        if (sort_by_doubles) {
            sort_by_doubles = false;
            sortPingPong();
            genRankingsHtml(PingPong);
        }
    });

    $("#doubles_rank_header").on("click", function()
    {
        if (!sort_by_doubles) {
            sort_by_doubles = true;
            sortPingPong();
            genRankingsHtml(PingPong);
        }
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
