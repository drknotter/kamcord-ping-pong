var PingPong = [];

var Elo = Object.create(null);

Elo.setMatchWinners = function(matches)
{
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
        matches[m]["winner"] = (w1 > w2) ? 1 : ((w2 > w1) ? 2 : 0);
    }
}

Elo.setPingPong = function(data)
{
    var players = [];
    var matches = [];
    var doubles_matches = [];

    players = Elo.readPlayers(data);
    matches = Elo.readSinglesMatches(data);
    doubles_matches = Elo.readDoublesMatches(data);

    var stats = {};

    for( var p=0; p<players.length; p++ )
    {
        stats[players[p]["name"]] =
            {
                "rank": players[p]["rank"],
                "doubles-rank": players[p]["doubles-rank"],
                "wins": 0,
                "losses": 0,
                "matches": 0,
                "history": [],
                "doubles-wins": 0,
                "doubles-losses": 0,
                "doubles-matches": 0,
                "doubles-history": [],
                "inactive": players[p]["inactive"]
            };
    }

    Elo.populateSinglesInformation(matches, players, stats);
    Elo.populateDoublesInformation(doubles_matches, players, stats);

    PingPong = [];
    for( var name in stats )
    {
        if( stats.hasOwnProperty(name) )
        {
            var player = stats[name];
            player["name"] = name;
            PingPong.push(player);
        }
    }
    PingPong.sort(function(a,b){return b['rank']-a['rank']});
}

Elo.readPlayers = function(data)
{
    var players = [];
    if( data["players"] && data["players"].constructor != Array )
    {
        for( var key in data["players"] )
        {
            players.push(data["players"][key])
        }
    }
    else if( data["players"] )
    {
        players = data["players"];
    }
    return players;
}

Elo.readSinglesMatches = function(data)
{
    var matches = [];
    if( data["matches"] && data["matches"].constructor != Array )
    {
        for( var key in data["matches"] )
        {
            matches.push(data["matches"][key])
        }
    }
    else if( data["matches"] )
    {
        matches = data["matches"];
    }
    matches.sort(function(a,b){return a["timestamp"] - b["timestamp"];});
    return matches;
}

Elo.readDoublesMatches = function(data)
{
    var matches = [];
    if( data["doubles-matches"] && data["doubles-matches"].constructor != Array )
    {
        for( var key in data["doubles-matches"] )
        {
            matches.push(data["doubles-matches"][key])
        }
    }
    else if( data["doubles-matches"] )
    {
        matches = data["doubles-matches"];
    }
    matches.sort(function(a,b){return a["timestamp"] - b["timestamp"];});
    return matches;
}


Elo.populateSinglesInformation = function(matches, players, stats)
{
    for( var m=0; m<matches.length; m++ )
    {
        // Parse match information.
        var sets = matches[m]["sets"];
        var w1=0.0, w2=0.0;
        for( var s=0; s<sets.length; s++ )
        {
            scores = sets[s].split("-");
            var p1 = parseFloat(scores[0]);
            var p2 = parseFloat(scores[1]);
            if( p1 > p2 )
            {
                w1 += 1.0;
            }
            else if( p2 > p1 )
            {
                w2 += 1.0
            }
        }

        var player1 = matches[m]["player1"];
        var player2 = matches[m]["player2"];

        var e1 = 1.0/(1.0 + Math.pow(10.0,(stats[player2]['rank']-stats[player1]['rank'])/400.0));
        var e2 = 1.0/(1.0 + Math.pow(10.0,(stats[player1]['rank']-stats[player2]['rank'])/400.0));

        var s1 = w1 > w2 ? 1.0 : 0.0;
        var s2 = w2 > w1 ? 1.0 : 0.0;

        // Adjust the players' ranks.
        player1Diff = stats[player1]['rank'];
        player2Diff = stats[player2]['rank'];
        stats[player1]['rank'] = stats[player1]['rank'] + Elo.kFactor(stats[player1]) * (s1 - e1)
        stats[player2]['rank'] = stats[player2]['rank'] + Elo.kFactor(stats[player2]) * (s2 - e2)
        player1Diff = stats[player1]['rank'] - player1Diff;
        player2Diff = stats[player2]['rank'] - player2Diff;

        // Increment the players' match counts.
        stats[player1]['matches'] += 1
        stats[player2]['matches'] += 1

        // Update the players' records.
        stats[player1]['wins'] += w1 > w2 ? 1 : 0
        stats[player1]['losses'] += w2 > w1 ? 1 : 0
        stats[player2]['wins'] += w2 > w1 ? 1 : 0
        stats[player2]['losses'] += w1 > w2 ? 1 : 0

        // Update the players' histories.
        stats[player1]['history'].push({'winner':(w1>w2?true:false),'versus':player2, 'scoreDiff': player1Diff, 'challenger': true, 'timestamp': matches[m]["timestamp"],'current_rank': stats[player1]['rank']})
        stats[player2]['history'].push({'winner':(w2>w1?true:false),'versus':player1, 'scoreDiff': player2Diff, 'challenger': false, 'timestamp': matches[m]["timestamp"], 'current_rank': stats[player2]['rank']})
    }
}

Elo.populateDoublesInformation = function(matches, players, stats)
{
    for( var m=0; m<matches.length; m++ )
    {
        // Parse match information.
        var sets = matches[m]["sets"];
        var w1=0.0, w2=0.0;
        for( var s=0; s<sets.length; s++ )
        {
            var scores = sets[s].split("-");
            var p1 = parseFloat(scores[0]);
            var p2 = parseFloat(scores[1]);
            if( p1 > p2 )
            {
                w1 += 1.0;
            }
            else if( p2 > p1 )
            {
                w2 += 1.0
            }
        }

        var team1 = matches[m]["team1"];
        var team2 = matches[m]["team2"];
        var team1_players = team1.split("&").sort();
        var team2_players = team2.split("&").sort();
        var player1 = team1_players[0];
        var player2 = team1_players[1];
        var player3 = team2_players[0];
        var player4 = team2_players[1];

        var team1_average = (stats[team1_players[0]]['doubles-rank'] + stats[team1_players[1]]['doubles-rank']) / 2.0;
        var team2_average = (stats[team2_players[0]]['doubles-rank'] + stats[team2_players[1]]['doubles-rank']) / 2.0;

        var e1 = 1.0/(1.0 + Math.pow(10.0,(team2_average-team1_average)/400.0));
        var e2 = 1.0/(1.0 + Math.pow(10.0,(team1_average-team2_average)/400.0));

        var s1 = w1 > w2 ? 1.0 : 0.0;
        var s2 = w2 > w1 ? 1.0 : 0.0;

        // Adjust the players' ranks.
        player1Diff = stats[player1]['doubles-rank'];
        player2Diff = stats[player2]['doubles-rank'];
        player3Diff = stats[player3]['doubles-rank'];
        player4Diff = stats[player4]['doubles-rank'];
        stats[player1]['doubles-rank'] = stats[player1]['doubles-rank'] + Elo.kFactorDoubles(stats[player1]) * (s1 - e1)
        stats[player2]['doubles-rank'] = stats[player2]['doubles-rank'] + Elo.kFactorDoubles(stats[player2]) * (s1 - e1)
        stats[player3]['doubles-rank'] = stats[player3]['doubles-rank'] + Elo.kFactorDoubles(stats[player3]) * (s2 - e2)
        stats[player4]['doubles-rank'] = stats[player4]['doubles-rank'] + Elo.kFactorDoubles(stats[player4]) * (s2 - e2)
        player1Diff = stats[player1]['doubles-rank'] - player1Diff;
        player2Diff = stats[player2]['doubles-rank'] - player2Diff;
        player3Diff = stats[player3]['doubles-rank'] - player3Diff;
        player4Diff = stats[player4]['doubles-rank'] - player4Diff;

        // Increment the players' match counts.
        stats[player1]['doubles-matches'] += 1
        stats[player2]['doubles-matches'] += 1
        stats[player3]['doubles-matches'] += 1
        stats[player4]['doubles-matches'] += 1

        // Update the players' records.
        stats[player1]['doubles-wins'] += w1 > w2 ? 1 : 0
        stats[player1]['doubles-losses'] += w2 > w1 ? 1 : 0
        stats[player2]['doubles-wins'] += w1 > w2 ? 1 : 0
        stats[player2]['doubles-losses'] += w2 > w1 ? 1 : 0
        stats[player3]['doubles-wins'] += w2 > w1 ? 1 : 0
        stats[player3]['doubles-losses'] += w1 > w2 ? 1 : 0
        stats[player4]['doubles-wins'] += w2 > w1 ? 1 : 0
        stats[player4]['doubles-losses'] += w1 > w2 ? 1 : 0

        // Update the players' histories.
        stats[player1]['doubles-history'].push({'winner':(w1>w2?true:false),'with':player2, 'versus1':player3, 'versus2':player4, 'scoreDiff': player1Diff, 'challenger': true, 'timestamp': matches[m]["timestamp"],'current_rank': stats[player1]['doubles-rank']})
        stats[player2]['doubles-history'].push({'winner':(w1>w2?true:false),'with':player1, 'versus1':player3, 'versus2':player4, 'scoreDiff': player2Diff, 'challenger': true, 'timestamp': matches[m]["timestamp"],'current_rank': stats[player2]['doubles-rank']})
        stats[player3]['doubles-history'].push({'winner':(w2>w1?true:false),'with':player4, 'versus1':player1, 'versus2':player2, 'scoreDiff': player3Diff, 'challenger': false, 'timestamp': matches[m]["timestamp"], 'current_rank': stats[player3]['doubles-rank']})
        stats[player4]['doubles-history'].push({'winner':(w2>w1?true:false),'with':player3, 'versus1':player1, 'versus2':player2, 'scoreDiff': player4Diff, 'challenger': false, 'timestamp': matches[m]["timestamp"], 'current_rank': stats[player4]['doubles-rank']})
    }
}

Elo.kFactor = function(playerStats)
{
    if( playerStats['matches'] < 20 )
    {
        return 32;
    }
    else if( playerStats['rank'] < 2000 )
    {
        return 24;
    }
    else
    {
        return 16;
    }
}

Elo.kFactorDoubles = function(playerStats)
{
    if( playerStats['doubles-matches'] < 20 )
    {
        return 32;
    }
    else if( playerStats['doubles-rank'] < 2000 )
    {
        return 24;
    }
    else
    {
        return 16;
    }
}
