import re


def check_password_strength(password):
    result = False
    strength = 0
    #length>=8
    if len(password) >= 8:
        strength += 1
    #Upper&Lower&Num character
    upperc = False
    lowerc = False
    numc = False
    for tmp in password:
        if tmp.isupper():
            upperc = True
        if tmp.islower():
            lowerc = True
        if tmp.isnumeric():
            numc = True
        if upperc and lowerc and numc:
            strength += 1
            break
    if strength == 2:
        result = True
    return result

def check_email(email):
    result = False
    if re.fullmatch(r"[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}", email):
        result = True
    return result


