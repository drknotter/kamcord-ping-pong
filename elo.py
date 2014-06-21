#!/usr/local/bin/python

def k_factor(player):
    if( player['matches'] < 20 ):
        return 32
    elif( player['rank'] < 2000 ):
        return 24
    else:
        return 16

def calculate_player_stats(games_log):
    stats = {}
    f = open(games_log)

    for line in f:

        if( line[0] == '#' ):
            continue

        (date, player1, player2, matches) = map(lambda x: x.strip(), line.split(','))
        
        if( player1 not in stats ):
            stats[player1] = {'rank': 1000, 'matches': 0}
        
        if( player2 not in stats ):
            stats[player2] = {'rank': 1000, 'matches': 0}

        e1 = 1.0/(1.0 + pow(10.0,(stats[player2]['rank']-stats[player1]['rank'])/400.0))
        e2 = 1.0/(1.0 + pow(10.0,(stats[player1]['rank']-stats[player2]['rank'])/400.0))

        (s1, s2, total) = (0.0, 0.0, 0.0)
        for match in map(lambda x: x.strip(), matches.split('|')):
            (p1, p2) = map(lambda x: int(x), match.split('-'))
            s1 += p1
            s2 += p2

        total = s1 + s2
        s1 /= total
        s2 /= total

        # Adjust the players' ranks.
        stats[player1]['rank'] = stats[player1]['rank'] + k_factor(stats[player1]) * (s1 - e1)
        stats[player2]['rank'] = stats[player2]['rank'] + k_factor(stats[player2]) * (s2 - e2)

        # Increment the players' match counts.
        stats[player1]['matches'] += 1
        stats[player2]['matches'] += 1

    f.close()

    return stats

def player_to_html(player_name, stat):
    html = "<li><span class='player_name'>" + player_name + "</span>: <span class='player_rank'>" + stat['rank'] + "</span></li>"

def gen_rankings_page():
    f = open('rankings.template.html')
    template = f.read()
    f.close()

    stats = calculate_player_stats('games.log')
    rank_list = map(player_to_html, stats.items())
    print(rank_list)

# gen_rankings_page()
print calculate_player_stats('games.log')
