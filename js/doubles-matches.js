var n_sets = 0;
var max_sets = 3;

$(document).ready(function()
{
    var seasonId = getQueryParams(document.location.search).s;
    new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/" + (seasonId ? "seasons/" + seasonId + "/" : "") + "doubles-matches/").on("value", handleMatches);
    new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/" + (seasonId ? "seasons/" + seasonId + "/" : "") + "doubles-pending/").on("value", handlePending);
    addSeasonQueryParams(seasonId);
    initClickHandlers();
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


function handleMatches(snapshot)
{
    var snapshotVals = snapshot.val();
    if( snapshotVals == null )
    {
        genMatchesHtml([]);
    }

    var keys = null;
    var matches = null;
    if( snapshotVals.constructor != Array )
    {
        keys = [];
        matches = [];
        for( var key in snapshotVals )
        {
            keys.push(key);
            matches.push(snapshotVals[key])
        }
    }
    else
    {
        keys = new Array(snapshotVals.length);
        for( var i=0; i<keys.length; i++ )
        {
            keys[i] = i;
        }
        matches = snapshotVals;
    }

    if( matches != null )
    {
        Elo.setMatchWinners(matches);
        genMatchesHtml(matches);
    }
}

function handlePending(snapshot)
{
    var snapshotVals = snapshot.val();
    if( snapshotVals == null )
    {
        genPendingMatchesHtml([], []);
    }

    var keys = null;
    var pending = null;
    if( snapshotVals.constructor != Array )
    {
        keys = [];
        pending = [];
        for( var key in snapshotVals )
        {
            keys.push(key);
            pending.push(snapshotVals[key])
        }
    }
    else
    {
        keys = new Array(snapshotVals.length);
        for( var i=0; i<keys.length; i++ )
        {
            keys[i] = i;
        }
        pending = snapshotVals;
    }

    if( pending != null )
    {
        Elo.setMatchWinners(pending);
        genPendingMatchesHtml(keys, pending);
    }
}

function genMatchesHtml(matches)
{
    $("#matches").empty();
    for( var m=matches.length-1; m>=0; m-- )
    {
        $("#matches").append(genMatchHtml(matches[m]));
    }
}

function genPendingMatchesHtml(keys, matches)
{
    $("#pending").empty();
    for( var m=matches.length-1; m>=0; m-- )
    {
        var pendingMatch = $("#pending").append(genPendingHtml(matches[m])).children(":last-child");
        pendingMatch.data({"key": keys[m], "match": matches[m]});
        pendingMatch.on("click", function()
        {
            acceptPendingMatch($(this).data()['key'], $(this).data()['match']);
        });
    }
}

function genMatchHtml(match)
{
    var htmlString = "<li>";
    htmlString += genMatchInfoHtml(match);
    htmlString += "</li>";
    return htmlString;
}

function genPendingHtml(match)
{
    var htmlString = "<li>";
    htmlString += "<div class='pending'>PENDING</div>";
    htmlString += genMatchInfoHtml(match);
    htmlString += "</li>";
    return htmlString;
}

function genMatchInfoHtml(match)
{
    var team1_players = match['team1'].split('&').sort();
    var team2_players = match['team2'].split('&').sort();
    var winner = match["winner"];

    var seasonId = getQueryParams(document.location.search).s;
    var htmlString = "";
    htmlString += "<span class='date'>" + new Date(match['timestamp']).toLocaleDateString() + "</span>";
    htmlString += "<span class='team1 " + (winner == 1 ? "winner" : (winner == 2 ) ? "loser" : "") + "'>";
    htmlString += "<a href='player.html?n=" + team1_players[0] + (seasonId?"&s="+seasonId:"") + "'>";
    htmlString += team1_players[0];
    htmlString += "</a>";
    htmlString += " &amp; "
    htmlString += "<a href='player.html?n=" + team1_players[1] + (seasonId?"&s="+seasonId:"") + "'>";
    htmlString += team1_players[1];
    htmlString += "</a>";
    htmlString += "</span>";
    htmlString += "<span class='vs'>vs.</span>";
    htmlString += "<span class='team2 " + (winner == 2 ? "winner" : (winner == 1 ) ? "loser" : "") + "'>";
    htmlString += "<a href='player.html?n=" + team2_players[0] + (seasonId?"&s="+seasonId:"") + "'>";
    htmlString += team2_players[0];
    htmlString += "</a>";
    htmlString += " &amp; "
    htmlString += "<a href='player.html?n=" + team2_players[1] + (seasonId?"&s="+seasonId:"") + "'>";
    htmlString += team2_players[1];
    htmlString += "</a>";
    htmlString += "</span>";
    htmlString += "<span class='sets'>";
    for( var s=0; s<match['sets'].length; s++ )
    {
        htmlString += "<span class='set'>" + match['sets'][s] + "</span>";
    }
    htmlString += "</span>";
    return htmlString;
}

function initClickHandlers()
{
    $("#new").on("click", function()
    {
        initNewMatchDialog();
        $(document).scrollTop(0);
        $("#new_match_background").fadeIn(200);
        $("#player1_input").focus();
    });

    $("#close_new_match,#cancel").on("click", function()
    {
        $("#new_match_background").fadeOut(200);
    });
    $("#close_auth").on("click", function()
    {
        $("#auth_background").fadeOut(200);
    });
    $("#submit").on("click", function()
    {
        submitNewMatch();
    });
}

function initNewMatchDialog()
{
    $("#sets_input").empty();
    $("#sets_input").append(genNewSetHtml());
    $(".score").last().keypress(function(e) {
        if (e.which == 13) {
            submitNewMatch();
        }
    });
    n_sets = 1;
}

function genNewSetHtml()
{
    var htmlString = "<li>";
    htmlString += "<input class='score team1' /> - <input class='score team2' />"
    htmlString += "</li>";
    return htmlString;
}

function submitNewMatch()
{
    var player1 = $("#player1_input").val();
    var player2 = $("#player2_input").val();
    var player3 = $("#player3_input").val();
    var player4 = $("#player4_input").val();

    var match = {};
    match['team1'] = player1 + '&' + player2;
    match['team2'] = player3 + '&' + player4;
    match['sets'] = [];
    var sets = $("#sets_input li");
    for( var s=0; s<sets.length; s++ )
    {
        var team1Score = $(sets[s]).children(".team1");
        var team2Score = $(sets[s]).children(".team2");
        match['sets'].push("{0}-{1}".format(team1Score.val(), team2Score.val()));
    }
    console.log(match);
    var matchRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/doubles-pending/").push(match);
    matchRef.update({'timestamp': Firebase.ServerValue.TIMESTAMP})
    $("#new_match_background").fadeOut(200);
}

function acceptPendingMatch(key, match)
{
    $("body").scrollTop(0);
    $("#auth_background").fadeIn(200);
    $("#pending_match_info").html(genMatchHtml(match));
    $("#accept").off();
    $("#reject").off();

    $("#accept").on("click", function()
    {
        var ref = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/");
        var email = $("#username_input").val();
        var password = $("#password_input").val();
        ref.authWithPassword({"email":email, "password": password}, function(error, authData)
            {
                if( error )
                {
                    console.log("Login failed with error: ", error);
                }
                else
                {
                    console.log("Login succeeded with authData: ", authData);
                    var pingpongRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong");
                    pingpongRef.once('value', function(snapshot) {
                        var players = Elo.readPlayers(snapshot.val());
                        var playerNames = [];
                        for( var i=0; i<players.length; i++ )
                        {
                            playerNames.push(players[i]['name']);
                        }
                        var matchPlayerNames = [
                            match['team1'].split('&')[0], 
                            match['team1'].split('&')[1],
                            match['team2'].split('&')[0], 
                            match['team2'].split('&')[1]];
                        for( var i=0; i<matchPlayerNames.length; i++ )
                        {
                            if( playerNames.indexOf(matchPlayerNames[i]) == -1 )
                            {
                                pingpongRef.child("players").push(
                                    {'name':matchPlayerNames[i], 'rank':1500, 'doubles-rank':1500},
                                    function(error)
                                    {
                                        if( error )
                                        {
                                            console.log("push new player failed with error: ", error);
                                        }
                                    });
                            }
                        }
                    });
                    pingpongRef.child("doubles-matches").push(match, function(error)
                    {
                        if( error )
                        {
                            console.log("push failed with error: ", error);
                        }
                        else
                        {
                            pingpongRef.child("doubles-pending").child(key).remove();
                        }
                    });
                }
            });
        $("#auth_background").fadeOut(200);
    });

    $("#reject").on("click", function()
    {
        new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/doubles-pending").child(key).remove();
        $("#auth_background").fadeOut(200);
    });
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
