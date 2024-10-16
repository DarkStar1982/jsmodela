from django.shortcuts import render
from django.http import JsonResponse
from pages.operations import save_model

def home(request, model_id):
    if request.method == 'GET':
        model_hash = request.GET.get("model_hash")
        sha256_key = request.build_absolute_uri()
        print(sha256_key)
        return render(request, "pages/jsmodels.html", {})

    if request.method == 'POST':
        post_data = request.POST.get("post_data")
        save_model(post_data)
        return render(request, "pages/jsmodels.html", {})