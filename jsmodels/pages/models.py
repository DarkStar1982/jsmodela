from django.db import models
from django.contrib import admin

# satellite TLE record + system definition data

class SharedModelData(models.Model):
	document_id = models.IntegerField(default=0, primary_key=True)
	model_hash = models.CharField(max_length=255)
	input_vars = models.CharField(max_length=16384) 
	model_code = models.CharField(max_length=65335) 
	output_vars = models.CharField(max_length=16384) 
	model_hash = models.CharField(max_length=255)
