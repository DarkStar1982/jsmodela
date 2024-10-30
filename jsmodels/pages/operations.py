import json
from datetime import datetime
from pages.models import SharedModelData
import hashlib

def save_model(post_data):
	model_data = json.loads(post_data)
	model_instance = SharedModelData()
	current_date = datetime.now()
	datetime_with_ms = current_date.strftime('%Y-%m-%d %H:%M:%S.%f')
	model_instance.document_id = SharedModelData.objects.latest('document_id').document_id + 1
	model_instance.input_vars = model_data["inputs"]
	model_instance.model_code = model_data["code"]
	model_instance.output_vars = model_data["outputs"] 
	model_instance.model_hash = get_model_hash(model_data["code"])
	model_instance.save()
	return model_instance.model_hash


def get_model_hash(str_code):
	current_date = datetime.now()
	datetime_with_ms = current_date.strftime('%Y-%m-%d %H:%M:%S.%f')
	string_to_be_hashed = str_code + datetime_with_ms
	hash_value = hashlib.sha256(string_to_be_hashed.encode('utf-8')).hexdigest()
	return hash_value

def load_model(model_id):
	print(model_id)
	model_data = SharedModelData.objects.filter(model_hash=model_id)[0]
	obj_data = {
		"code": model_data.model_code,
		"input_vars":model_data.input_vars,
		"output_vars":model_data.output_vars
	}
	return obj_data