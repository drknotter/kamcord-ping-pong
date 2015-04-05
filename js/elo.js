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

    if( data["players"] && data["players"].constructor != Array )
    {
        for( var key in data["players"] )
        {
            players.push(data["players"][key])
        }
    }
    else
    {
        players = data["players"];
    }
    if( data["matches"] && data["matches"].constructor != Array )
    {
        for( var key in data["matches"] )
        {
            matches.push(data["matches"][key])
        }
    }
    else
    {
        matches = data["matches"];
    }
    matches.sort(function(a,b){return a["timestamp"] - b["timestamp"];});

    var stats = {};

    for( var p=0; p<players.length; p++ )
    {
        stats[players[p]["name"]] =
            {
                "rank": players[p]["rank"],
                "wins": 0,
                "losses": 0,
                "matches": 0,
                "history": [],
                "inactive": players[p]["inactive"]
            };
    }

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

        if( !Elo.playerExists(players, player1) )
        {
            var average = 0.0;
            for( var p=0; p<players.length; p++ )
            {
                average += players[p]["rank"];
            }
            if( players.length > 0 )
            {
                average /= players.length;
            }
            else
            {
                average = 1500.0;
            }

            stats[player1] = 
                {
                    "rank": average,
                    "wins": 0,
                    "losses": 0,
                    "matches": 0,
                    "history": []
                };
        }

        if( !Elo.playerExists(players, player2) )
        {
            var average = 0.0;
            for( var p=0; p<players.length; p++ )
            {
                average += players[p]["rank"];
            }
            if( players.length > 0 )
            {
                average /= players.length;
            }
            else
            {
                average = 1500.0;
            }

            stats[player2] = 
                {
                    "rank": average,
                    "wins": 0,
                    "losses": 0,
                    "matches": 0,
                    "history": []
                };
        }

        var e1 = 1.0/(1.0 + Math.pow(10.0,(stats[player2]['rank']-stats[player1]['rank'])/400.0));
        var e2 = 1.0/(1.0 + Math.pow(10.0,(stats[player1]['rank']-stats[player2]['rank'])/400.0));

        var s1 = w1 > w2 ? 1.0 : 0.0;
        var s2 = w2 > w1 ? 1.0 : 0.0;

        // Adjust the players' ranks.
        stats[player1]['rank'] = stats[player1]['rank'] + Elo.kFactor(stats[player1]) * (s1 - e1)
        stats[player2]['rank'] = stats[player2]['rank'] + Elo.kFactor(stats[player2]) * (s2 - e2)

        // Increment the players' match counts.
        stats[player1]['matches'] += 1
        stats[player2]['matches'] += 1

        // Update the players' records.
        stats[player1]['wins'] += w1 > w2 ? 1 : 0
        stats[player1]['losses'] += w2 > w1 ? 1 : 0
        stats[player2]['wins'] += w2 > w1 ? 1 : 0
        stats[player2]['losses'] += w1 > w2 ? 1 : 0

        // Update the players' histories.
        stats[player1]['history'].push({'versus':player2, 'score': w1+"-"+w2, 'challenger': true, 'timestamp': matches[m]["timestamp"],'current_rank': stats[player1]['rank']})
        stats[player2]['history'].push({'versus':player1, 'score': w2+"-"+w1, 'challenger': false, 'timestamp': matches[m]["timestamp"], 'current_rank': stats[player2]['rank']})
    }

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

Elo.playerExists = function(players, playerName)
{
    for( var p=0; p<players.length; p++ )
    {
        if( players[p]["name"] == playerName )
        {
            return true;
        }
    }
    return false;
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
