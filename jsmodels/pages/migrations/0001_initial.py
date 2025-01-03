# Generated by Django 5.1.1 on 2024-12-30 01:56

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='SharedModelData',
            fields=[
                ('document_id', models.IntegerField(default=0, primary_key=True, serialize=False)),
                ('input_vars', models.CharField(max_length=16384)),
                ('model_code', models.CharField(max_length=65335)),
                ('output_vars', models.CharField(max_length=16384)),
                ('model_hash', models.CharField(max_length=255)),
            ],
        ),
    ]
