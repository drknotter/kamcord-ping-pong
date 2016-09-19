$(document).ready(function()
{
    new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/").on("value", handleData);
    var seasonId = getQueryParams(document.location.search).s;
    addSeasonQueryParams(seasonId);
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

function handleData(snapshot) {
    var data = snapshot.val();
    handleSeasons(data['seasons']);
}

function handleSeasons(seasonData) {
    if( seasonData == null )
    {
        genSeasonsHtml([], []);
    }

    var keys = null;
    var seasons = null;
    if( seasonData.constructor != Array )
    {
        keys = [];
        seasons = [];
        for( var key in seasonData )
        {
            keys.push(key);
            seasons.push(seasonData[key])
        }
    }
    else
    {
        keys = new Array(seasonData.length);
        for( var i=0; i<keys.length; i++ )
        {
            keys[i] = i;
        }
        seasons = seasonData;
    }

    if( seasons != null )
    {
        genSeasonsHtml(keys, seasons);
    }
}

function genSeasonsHtml(seasonIds, seasons) {
    $("#seasons").empty();
    $("#seasons").append(genSeasonHtml(null, {'seasonName': 'Current Season', 'timestamp': new Date()}));
    for( var m=seasons.length-1; m>=0; m-- )
    {
        $("#seasons").append(genSeasonHtml(seasonIds[m], seasons[m]));
    }
}

function genSeasonHtml(seasonId, season) {
    var htmlString = "<li>";
    htmlString += genSeasonInfoHtml(seasonId, season);
    htmlString += "</li>";
    return htmlString;
}

function genSeasonInfoHtml(seasonId, season) {
    var htmlString = "";
    htmlString += "<a href='rankings.html" + (seasonId != null ? "?s=" + seasonId : "") + "'>";
    htmlString += "<span class='date'>" + new Date(season['timestamp']).toLocaleDateString() + "</span>";
    htmlString += "<span class='name'>" + season['seasonName'] + "</span>";
    htmlString += "</a>";
    return htmlString;
}