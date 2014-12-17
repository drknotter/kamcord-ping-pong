var n_sets = 0;
var max_sets = 3;

$(document).ready(function()
{
    new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/matches/").on("value", handleMatches);
    new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/pending/").on("value", handlePending);
    initClickHandlers();
});

function handleMatches(snapshot)
{
    var matches = snapshot.val();
    Elo.setMatchWinners(matches);
    genMatchesHtml(matches);
}

function handlePending(snapshot)
{
    var snapshotVals = snapshot.val();
    var pending = null;
    if( snapshotVals.constructor != Array )
    {
        pending = [];
        for( var key in snapshotVals )
        {
            pending.push(snapshotVals[key])
        }
    }
    else
    {
        pending = snapshotVals;
    }

    if( pending != null )
    {
        Elo.setMatchWinners(pending);
        genPendingMatchesHtml(pending);
    }
}

function genMatchesHtml(matches)
{
    $("#matches").empty();
    for( var m=0; m<matches.length; m++ )
    {
        $("#matches").append(genMatchHtml(matches[m]));
    }
}

function genPendingMatchesHtml(matches)
{
    $("#pending").empty();
    for( var m=0; m<matches.length; m++ )
    {
        $("#pending").append(genPendingHtml(matches[m]));
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
    var htmlString = "";
    var winner = match["winner"];
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
    var now = new Date();
    match['date'] = "{0}-{1}-{2}".format(now.getFullYear(), now.getMonth()+1, now.getDate());
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
    new Firebase("https://crackling-fire-6808.firebaseio.com/ping-pong/pending/").push(match);
    $("#new_match_background").fadeOut(200);
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
