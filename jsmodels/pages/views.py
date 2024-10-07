from django.shortcuts import render
from django.http import JsonResponse


def home(request):
    if request.method == 'GET':
        return render(request, "pages/jsmodels.html", {})

    if request.method == 'POST':
        return render(request, "pages/jsmodels.html", {})

def api(request):
    # load from DB
    asteroid_list = []
    MAINBELT_ONES = []
    return JsonResponse({"pha":asteroid_list,"mba":MAINBELT_ONES}, safe=False)