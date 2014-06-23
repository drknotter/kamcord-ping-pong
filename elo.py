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
            stats[player1] = {'rank': 1000, 'matches': 0, 'wins': 0, 'losses': 0, 'history': []}
        
        if( player2 not in stats ):
            stats[player2] = {'rank': 1000, 'matches': 0, 'wins': 0, 'losses': 0, 'history': []}

        e1 = 1.0/(1.0 + pow(10.0,(stats[player2]['rank']-stats[player1]['rank'])/400.0))
        e2 = 1.0/(1.0 + pow(10.0,(stats[player1]['rank']-stats[player2]['rank'])/400.0))

        (s1, s2, total, w1, w2) = (0.0, 0.0, 0.0, 0.0, 0.0)
        for match in map(lambda x: x.strip(), matches.split('|')):
            (p1, p2) = map(lambda x: float(x), match.split('-'))
            s1 += p1
            s2 += p2
            if( p1 > p2 ):
                w1 += 1.0
            elif( p2 > p1 ):
                w2 += 1.0

        s1 *= w1
        s2 *= w2
        total = s1 + s2
        s1 /= total
        s2 /= total

        # Adjust the players' ranks.
        stats[player1]['rank'] = stats[player1]['rank'] + k_factor(stats[player1]) * (s1 - e1)
        stats[player2]['rank'] = stats[player2]['rank'] + k_factor(stats[player2]) * (s2 - e2)

        # Increment the players' match counts.
        stats[player1]['matches'] += 1
        stats[player2]['matches'] += 1

        # Update the players' records.
        stats[player1]['wins'] += 1 if w1 > w2 else 0
        stats[player1]['losses'] += 1 if w2 > w1 else 0
        stats[player2]['wins'] += 1 if w2 > w1 else 0
        stats[player2]['losses'] += 1 if w1 > w2 else 0

        # Update the players' histories.
        stats[player1]['history'].append({'versus':player2, 'score': '%i-%i' % (w1, w2), 'challenger': True, 'date': date})
        stats[player2]['history'].append({'versus':player1, 'score': '%i-%i' % (w2, w1), 'challenger': False, 'date': date})

    f.close()

    stats = map(lambda x: {'name': x[0], 'rank': x[1]['rank'], 'matches': x[1]['matches'], 'wins': x[1]['wins'], 'losses': x[1]['losses'], 'history': x[1]['history']}, stats.items())
    stats.sort(lambda x, y: 1 if x['rank'] < y['rank'] else \
        -1 if x['rank'] > y['rank'] else \
        -1 if x['matches'] < y['matches'] else \
        1 if x['matches'] > y['matches'] else 0)

    return stats

def calculate_past_matches(games_log):
    matches = []
    f = open(games_log)

    for line in f:

        if( line[0] == '#' ):
            continue

        (date, player1, player2, set_string) = map(lambda x: x.strip(), line.split(','))
        sets = set_string.split('|')
        matches.append({'date': date, 'player1': player1, 'player2': player2, 'sets': sets})

    f.close()

    matches.sort(lambda x, y: 1 if x['date'] > y['date'] else -1 if x['date'] < y['date'] else 0)
    return matches

def player_to_html(player):
    html = "<li>"
    html += "<a class='player_name' href='players/" + player['name'].replace(' ','-') + ".html'>" + player['name'] + "</a>: "
    html += "<span class='player_rank'>" + str(int(player['rank'])) + "</span>"
    html += "</li>"
    return html

def gen_rankings_page(stats):
    f = open('rankings.template.html')
    template = f.read()
    f.close()

    html_items = map(player_to_html, stats)
    ranking_items = reduce(lambda x,y: x+'\n'+' '*12+y, html_items[1:], ' '*12+html_items[0])
    rankings_html = template.replace('_RANKING_ITEMS_', ranking_items)

    f = open('web/rankings.html', 'w')
    f.write(rankings_html)
    f.close()

def player_match_to_html(match):
    html = "<li>"
    html += "<span class='date'>" + match['date'] + "</span> - "
    html += "<span class='challenged'>" + ("Challenged" if match['challenger'] else "Challenged by") + "</span> "
    html += "<span class='other_player'>" + match['versus'] + "</span> - "
    html += "<span class='score'>" + match['score'] + "</span>"
    html += "</li>"
    return html

def gen_player_page(player):
    f = open('player.template.html')
    template = f.read()
    f.close()

    html_items = map(player_match_to_html, player['history'])
    match_items = reduce(lambda x,y: x+'\n'+' '*12+y, html_items[1:], ' '*12+html_items[0])
    player_html = template.replace('_MATCH_ITEMS_', match_items)
    player_html = player_html.replace('_PLAYER_NAME_', player['name'])
    player_html = player_html.replace('_PLAYER_RANK_', '%i' % (round(player['rank'])))
    player_html = player_html.replace('_PLAYER_RECORD_', '%i - %i' % (player['wins'], player['losses']))

    f = open('web/players/' + player['name'].replace(' ','-') + '.html', 'w')
    f.write(player_html)
    f.close()

def match_to_html(match):
    html = "<li>"
    html += "<span class='date'>" + match['date'] + "</span>: "
    html += "<span class='player1'>" + match['player1'] + "</span> "
    html += "vs. "
    html += "<span class='player2'>" + match['player2'] + "</span>, "
    html += "<span class='sets'>"
    html += "<span class='set'>" + ''.join(match['sets'], "</span>, <span class='set'>") + "</span>"
    html += "</span>"
    return html


def gen_matches_page():
    f = open('matches.template.html')
    template = f.read()
    f.close()

    html_items = map()

def go():
    stats = calculate_player_stats('games.log')

    gen_rankings_page(stats)

    for player in stats:
        gen_player_page(player)

    print calculate_past_matches('games.log')

go()