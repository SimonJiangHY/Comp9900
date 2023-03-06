import re
defined_type = ['Breakfast', 'Lunch', 'Dinner', 'Main', 'Drink', 'Snack']
defined_time = ['Under 10 min', 'Under 20 min', 'Under 30 min', 'Under 60 min', 'Over 60 min']


def check_type(cur_type):
    types = cur_type.split(",")
    result = True
    for cur_type in types:
        if cur_type not in defined_type:
            result = False
    return result


def check_ingredient(cur_ingredient):
    return True


def check_method(cur_method):
    return True


def check_time(cur_time):
    return True


def check_ingredient_detail(string):
    if re.fullmatch("([ A-Za-z]+:[ A-Za-z0-9\.]+,)*[ A-Za-z]+:[ A-Za-z0-9\.]+", string):
        return True
    else:
        return False


