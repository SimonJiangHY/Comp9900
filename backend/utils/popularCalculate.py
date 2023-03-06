import math


def get_popular(comment, view, like, follower, time):
    result = ((100 + 1 * view + 5 * like + 10 * comment) * pow(1.1, math.log(follower+1))) / math.exp(time/10)
    result = math.ceil(result)
    return result



