from django.http import HttpResponse

def index(request):
    line1 = '<h1 style="text-align: center">my first web page</h1>'
    line4 = '<a href="/play/">in play menu</a href>'
    line3 = '<hr>'
    line2 = '<image src="https://i2.hdslb.com/bfs/archive/76e5df2984c8880a1aae8fb67c9b3a42b3d2665e.png">'
    return HttpResponse(line1 + line4 + line3 + line2)

def play(request):
    line1 = '<h1 style="text-align: center">play menu</h1>'
    line3 = '<a href="/">return main page</a href>'
    line4 = '<hr>'
    line2 = '<image src="https://pic1.vqs.com/2017/1026/20171026104526887.jpg">'
    return HttpResponse(line1 + line3 + line4 + line2)
