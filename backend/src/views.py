import logging

from datetime import date
from dateutil.rrule import rrule, MONTHLY, YEARLY, WEEKLY
from dateutil.relativedelta import relativedelta
from dateutil.parser._parser import ParserError
import dateutil.parser
import json

from .models import Rule
from .serializers import RuleSerializer
from .exe_context import ExecutionParameters, ExecutionRules, ExecutionContext
from .generate_instances import get_transactions_up_to
from .daybydays import generate_daybydays

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.exceptions import APIException

from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.http import JsonResponse

from django.shortcuts import render
from django.http import HttpResponse
import csv

from .auth_utils import requires_scope


def use_global_exception_handler(f):
    def handler(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ObjectDoesNotExist as e:
            response_message = {
                "message": "Not Found"
            }
            logging.warn(response_message)

            response = JsonResponse(response_message)
            response.status_code = 404
            return response
        except ValueError as e:
            response_message = {
                "message": str(e)
            }
            logging.warn(response_message)

            response = JsonResponse(response_message)
            response.status_code = 400
            return response
        except AssertionError as e:
            response_message = {
                "message": str(e)
            }
            logging.warn(response_message)

            response = JsonResponse(response_message)
            response.status_code = 400
            return response
        except Exception as e:
            response_message = {
                "message": "Internal Server Error: " + str(e)
            }
            logging.warn(response_message)

            response = JsonResponse(response_message)
            response.status_code = 500
            return response

    return handler


#
# Rules API
#


@use_global_exception_handler
@api_view(['GET', 'POST'])
def rules_handler(*args, **kwargs):
    request = args[0]
    if request.method == 'GET': 
        return get_rule_list(*args, **kwargs)
    if request.method == "POST":
        return create_rule(*args, **kwargs)


@use_global_exception_handler
@api_view(['GET', 'DELETE', 'PUT'])
def rules_by_id_handler(*args, **kwargs):
    request = args[0]
    if request.method == 'GET': 
        return get_rule(*args, **kwargs)
    elif request.method == 'DELETE':
        return delete_rule(*args, **kwargs)
    elif request.method == 'PUT':
        return update_rule(*args, **kwargs)


@requires_scope("transactions:write")
def update_rule(request, rule_id, decoded):
    userid = decoded['sub']
    rule = Rule.objects.get(id=rule_id, userid=userid)
    rule_data = JSONParser().parse(request)
    rule_data["userid"] = userid
    rule_serializer = RuleSerializer(rule, data=rule_data)
    if rule_serializer.is_valid():
        rule_serializer.save()
        return Response(rule_serializer.data)
    return Response(rule_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@requires_scope("transactions:read")
def get_rule_list(request, decoded):
    userid = decoded['sub']
    rules = Rule.objects.filter(userid=userid)
    rule_serializer = RuleSerializer(rules, many=True)
    return Response({ "data": rule_serializer.data })

@requires_scope("transactions:read")
def get_rule(request, rule_id, decoded):
    userid = decoded['sub']
    rule = Rule.objects.get(id=rule_id, userid=userid)
    rule_serializer = RuleSerializer(rule) 
    return Response(rule_serializer.data)     

@requires_scope("transactions:write")
def create_rule(request, decoded):
    userid = decoded['sub']
    rule_data = JSONParser().parse(request)
    rule_data['userid'] = userid
    rule_serializer = RuleSerializer(data=rule_data)
    if rule_serializer.is_valid():
        rule_serializer.save()
        j = Response(rule_serializer.data, status=status.HTTP_201_CREATED) 
        return j
    return Response(rule_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@requires_scope("transactions:write")
def delete_rule(request, rule_id, decoded):
    userid = decoded['sub']
    rule = Rule.objects.get(id=rule_id, userid=userid)
    rule.delete()
    return Response(None, status=status.HTTP_204_NO_CONTENT)


#
# Ping
#


@use_global_exception_handler
@api_view(['GET'])
def hello_world(request):
    return Response({ "status": "UP" })


#
# Execute
#


def make_execution_parameters(request) -> ExecutionParameters:
    """
    Extracts execution parameters from request
    """
    start = request.GET.get('startDate', '')
    if start:
        start = dateutil.parser.parse(start).date()
    else:
        start = date.today()
    
    end = request.GET.get('endDate', '')
    if end:
        end = dateutil.parser.parse(end).date()
    else:
        end = start + relativedelta(months=12)
    
    current = request.GET.get('currentBalance', '0')
    if current:
        current = round(float(current), 2)
    else:
        current = 0
    
    set_aside = request.GET.get('setAside', '0')
    if set_aside:
        set_aside = round(float(set_aside), 2)
    else:
        set_aside = 0
    
    should_calculate_high_low = "highLow" in request.GET

    parameters = ExecutionParameters(
        start,
        end,
        current,
        set_aside,
        should_calculate_high_low,
    )
    parameters.assert_valid()

    return parameters


def make_execution_rules(rules) -> ExecutionRules:
    """
    Converts serialized rules from database into ExecutionRules object
    """
    rule_map = {}

    for rule in rules:
        #TODO Switch to 'id' instead of 'name' when the UI is ready for it
        rule_map[rule['name']] = {
            "rule": rule['rrule'],
            "value": float(rule['value']),
            "labels": rule['labels']
        }
    
    rules = ExecutionRules(rule_map)
    rules.assert_valid()
    return rules
    

def get_rules_from_database(userid: str) -> ExecutionRules:
    # Get rules from database
    database_rules = Rule.objects.filter(userid=userid)
    serialized_rules = RuleSerializer(database_rules, many=True).data
    return make_execution_rules(serialized_rules)


@use_global_exception_handler
@api_view(['GET'])
@requires_scope("transactions:read")
def process_transactions(request, decoded):
    userid = decoded["sub"]

    parameters = make_execution_parameters(request)
    rules = get_rules_from_database(userid)

    # Calculate transactions
    transactions = get_transactions_up_to(ExecutionContext(parameters, rules))
    results = list(map(lambda i: i.serialize(), transactions))

    return Response({ "transactions": results })


@use_global_exception_handler
@api_view(['GET'])
@requires_scope("transactions:read")
def process_daybydays(request, decoded):
    userid = decoded["sub"]

    # Pull out parameters
    parameters = make_execution_parameters(request)
    rules = get_rules_from_database(userid)

    # Calculate daybydays
    daybydays = generate_daybydays(ExecutionContext(parameters, rules))

    return Response({ "daybydays": daybydays })


@use_global_exception_handler
@api_view(['GET'])
@requires_scope("transactions:read")
def export_transactions(request, decoded):
    userid = decoded["sub"]
    parameters = make_execution_parameters(request)
    rules = get_rules_from_database(userid)
    
    transactions = get_transactions_up_to(ExecutionContext(parameters, rules))
    results = list(map(lambda i: i.serialize(), transactions))

    response = HttpResponse(content_type='text/csv')
    fileName = "Transactions." + parameters.start.strftime('%Y-%-m-%-d') + "." + parameters.end.strftime('%Y-%-m-%-d') + ".csv" 
    response['Content-Disposition'] = 'attachment; filename="' + fileName + '"'

    fieldnames = ['rule_id', 'value', 'day', 'balance', 'disposable_income']
    writer = csv.DictWriter(response, fieldnames=fieldnames)
    writer.writeheader()

    # Flatten transactions for csv file
    for result in results:
        transaction_dict_flat = { "rule_id": result["rule_id"], 
            "value":  result["value"],
            "day":  result["day"],    
            "balance": result["calculations"]["balance"],
            "disposable_income":  result["calculations"]["working_capital"],            
        }
        writer.writerow(transaction_dict_flat)

    return response
