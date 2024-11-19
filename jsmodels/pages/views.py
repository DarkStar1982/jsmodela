from django.shortcuts import render, redirect
from django.http import JsonResponse
from pages.operations import save_model,load_model
from django.http import JsonResponse


def home(request, model_id=None):
    if request.method == 'GET':
        model_hash = request.GET.get("model_hash")
        sha256_key = request.build_absolute_uri()
        if model_id is None:
            context = { 'model_hash': model_id, "mode":"editable"}
            return render(request, "pages/jsmodels.html", context)
        else:
            context = { 'model_hash': model_id, "mode":"readonly"}
            return render(request, "pages/jsmodels.html", context)

    if request.method == 'POST':
        post_data = request.POST.get("post_data")
        model_hash = save_model(post_data)
        url = "/model/"+model_hash
        return redirect(url)

def api(request):
    model_hash = request.GET.get("model_hash")
    data = load_model(model_hash)
    return JsonResponse(data)