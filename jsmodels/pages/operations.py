import json
from pages.models import SharedModelData
import hashlib

def save_model(post_data):
	model_data = json.loads(post_data)
	model_instance = SharedModelData()
	model_instance.document_id = SharedModelData.objects.latest('document_id').document_id + 1
	model_instance.input_vars = model_data["inputs"]
	model_instance.model_code = model_data["code"]
	model_instance.output_vars = model_data["outputs"] 
	model_instance.model_hash = hashlib.sha256(model_data["code"].encode('utf-8')).hexdigest()
	model_instance.save()