def f(x):
    if "@" not in x:
        return False
    return True

data = [{"a": 5}, {"a": 2}, {"a": 9}]

def s(d):
    return sorted(d, key=lambda x: x["a"])

def oldfunc():
    import time
    st = time.time()
    print("Hello")
    print(time.time() - st)
