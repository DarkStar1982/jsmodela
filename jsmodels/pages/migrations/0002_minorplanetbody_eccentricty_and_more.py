# Generated by Django 5.1.1 on 2024-10-06 17:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='minorplanetbody',
            name='eccentricty',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='minorplanetbody',
            name='semimajor_a',
            field=models.FloatField(default=0.0),
        ),
    ]
