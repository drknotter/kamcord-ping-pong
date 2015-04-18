var n_sets = 0;
var max_sets = 3;

$(document).ready(function()
{
    new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/doubles-matches/").on("value", handleMatches);
    new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/doubles-pending/").on("value", handlePending);
    initClickHandlers();
});

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

    var htmlString = "";
    htmlString += "<span class='date'>" + new Date(match['timestamp']).toLocaleDateString() + "</span>";
    htmlString += "<span class='team1 " + (winner == 1 ? "winner" : (winner == 2 ) ? "loser" : "") + "'>";
    htmlString += "<a href='player.html?n=" + team1_players[0] + "'>";
    htmlString += team1_players[0];
    htmlString += "</a>";
    htmlString += " &amp; "
    htmlString += "<a href='player.html?n=" + team1_players[1] + "'>";
    htmlString += team1_players[1];
    htmlString += "</a>";
    htmlString += "</span>";
    htmlString += "<span class='vs'>vs.</span>";
    htmlString += "<span class='team2 " + (winner == 2 ? "winner" : (winner == 1 ) ? "loser" : "") + "'>";
    htmlString += "<a href='player.html?n=" + team2_players[0] + "'>";
    htmlString += team2_players[0];
    htmlString += "</a>";
    htmlString += " &amp; "
    htmlString += "<a href='player.html?n=" + team2_players[1] + "'>";
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
    });

    $("#add_set").on("click", function()
    {
        if( n_sets < max_sets )
        {
            $("#sets_input").append(genNewSetHtml());
            n_sets += 1;
        }
    });
    $("#remove_set").on("click", function()
    {
        if( n_sets > 1 )
        {
            $("#sets_input li:last-child").remove();
            n_sets -= 1;
        }
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
    n_sets = 1;
}

function genNewSetHtml()
{
    var htmlString = "<li>";
    htmlString += "<input class='score player1' /> - <input class='score player2' />"
    htmlString += "</li>";
    return htmlString;
}

function submitNewMatch()
{
    var match = {};
    match['player1'] = $("#player1_input").val();
    match['player2'] = $("#player2_input").val();
    match['sets'] = [];
    var sets = $("#sets_input li");
    for( var s=0; s<sets.length; s++ )
    {
        var player1Score = $(sets[s]).children(".player1");
        var player2Score = $(sets[s]).children(".player2");
        match['sets'].push("{0}-{1}".format(player1Score.val(), player2Score.val()));
    }
    var matchRef = new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/pending/").push(match);
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
                    pingpongRef.child("matches").push(match, function(error)
                    {
                        if( error )
                        {
                            console.log("push failed with error: ", error);
                        }
                        else
                        {
                            pingpongRef.child("pending").child(key).remove();
                        }
                    });
                }
            });
        $("#auth_background").fadeOut(200);
    });

    $("#reject").on("click", function()
    {
        new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/pending").child(key).remove();
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