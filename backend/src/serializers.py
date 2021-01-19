from rest_framework import serializers 
from .models import Rule, Parameters, USERID_MAX_LENGTH, NAME_MAX_LENGTH, VALUE_MAX_DIGITS, VALUE_MAX_DECIMAL_DIGITS, DATE_MAX_LENGTH
from .hebrew import extract_hebrew
import logging
from dateutil.rrule import rrulestr, YEARLY, MONTHLY, WEEKLY
from datetime import datetime


def rrule_validation(rrulestring: str) -> str:
    try:
        hebrew = extract_hebrew(rrulestring)
        if hebrew:
            return rrulestring
        
        # Not hebrew

        rrule = rrulestr(rrulestring)

        assert rrule._freq in (YEARLY, MONTHLY, WEEKLY), "Unsupported frequency"

        return rrulestring
    except Exception:
        raise serializers.ValidationError("Invalid recurrence rule")

def name_validation(name: str) -> str:
    if (len(name) > NAME_MAX_LENGTH):
        raise serializers.ValidationError("Rule name can be no be no more than " + str(NAME_MAX_LENGTH) + " characters in length")
    return name

def userid_validation(userid: str) -> str:
    if (len(userid) > USERID_MAX_LENGTH):
        raise serializers.ValidationError("Userid can be no be no more than " + str(USERID_MAX_LENGTH) + " characters in length")
    return userid

def date_validation(date: str) -> str:
    if (len(date) > DATE_MAX_LENGTH):
        raise serializers.ValidationError("Date can be no be no more than " + str(DATE_MAX_LENGTH) + " characters in length")
    return date

class RuleSerializer(serializers.Serializer):

    id = serializers.PrimaryKeyRelatedField(read_only=True)
    userid = serializers.CharField(validators=[userid_validation])
    name = serializers.CharField(validators=[name_validation])
    rrule = serializers.CharField(validators=[rrule_validation])
    value = serializers.DecimalField(max_digits=VALUE_MAX_DIGITS, decimal_places=VALUE_MAX_DECIMAL_DIGITS, coerce_to_string=False)
    labels = serializers.JSONField(required=False)

    def create(self, validated_data):
        rule = Rule.objects.create(**validated_data)
        return rule
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.rrule = validated_data.get('rrule', instance.rrule)
        instance.value = validated_data.get('value', instance.value)
        instance.labels = validated_data.get('labels', instance.labels)
        instance.save()
        return instance


class ParametersSerializer(serializers.Serializer):
    id = serializers.PrimaryKeyRelatedField(read_only=True)
    userid = serializers.CharField(validators=[userid_validation])
    date = serializers.CharField(validators=[date_validation])

    balance = serializers.DecimalField(max_digits=VALUE_MAX_DIGITS, decimal_places=VALUE_MAX_DECIMAL_DIGITS, coerce_to_string=False)
    set_aside = serializers.DecimalField(max_digits=VALUE_MAX_DIGITS, decimal_places=VALUE_MAX_DECIMAL_DIGITS, coerce_to_string=False)

    def create(self, validated_data):
        if isinstance(validated_data["date"], str):
            validated_data["date"] = datetime.strptime(validated_data["date"], "%Y-%m-%d").date()
        rule = Parameters.objects.create(**validated_data)
        return rule
    
    def update(self, instance, validated_data):
        instance.balance = validated_data.get('balance', instance.balance)
        instance.set_aside = validated_data.get('set_aside', instance.set_aside)
        instance.save()
        return instance