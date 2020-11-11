# Generated by Django 3.1.1 on 2020-11-11 20:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('src', '0004_auto_20201111_2024'),
    ]

    operations = [
        migrations.AddField(
            model_name='rule',
            name='labels',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='rule',
            name='userid',
            field=models.CharField(default=None, editable=False, max_length=128),
            preserve_default=False,
        ),
    ]
