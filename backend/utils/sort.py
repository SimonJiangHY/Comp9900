
def sort_items(str):
    item = str.split(",")
    item.sort()
    result = ",".join(item)
    return result
