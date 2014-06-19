#!/usr/bin/python

def k_factor(ranking):
    return 32

rankings = dict()

f = open('games.log')
for line in f:
    (date, player1, player2, match1, match2, match3) = line.split(',')
    
    if( player1 not in rankings ):
        rankings[player1] = 1000
    
    if( player2 not in rankings ):
        rankings[player2] = 1000

    e1 = 1.0/(1.0 + pow(10.0,(rankings[player2]-rankings[player1])/400.0))
    e2 = 1.0/(1.0 + pow(10.0,(rankings[player1]-rankings[player2])/400.0))

    (s11,s21) = map(lambda x:int(x), match1.split('-'))
    (s12,s22) = map(lambda x:int(x), match2.split('-'))
    (s13,s23) = map(lambda x:int(x), match3.split('-'))

    total = s11 + s21 + s12 + s22 + s13 + s23
    s1 = float(s11 + s12 + s13) / total
    s2 = float(s21 + s22 + s23) / total

    rankings[player1] = int(round(rankings[player1] + k_factor(rankings[player1]) * (s1 - e1)))
    rankings[player2] = int(round(rankings[player2] + k_factor(rankings[player2]) * (s2 - e2)))

f.close()

print(rankings)
