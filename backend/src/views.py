import logging

from datetime import date
from datetime import datetime
from dateutil.rrule import rrule, MONTHLY, YEARLY, WEEKLY
from dateutil.relativedelta import relativedelta
from dateutil.parser._parser import ParserError
import dateutil.parser
import json

from .models import Rule, Parameters
from .serializers import RuleSerializer, ParametersSerializer
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
from django.db import IntegrityError
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
# Flags
#
import configcatclient
from configcatclient.user import User


def get_configcat_client():
    try:
        with open("/run/secrets/configcat-key") as f:
            key = f.read()
            if not key:
                return
            return configcatclient.create_client(key)
    except OSError:
        return


configcat_client = get_configcat_client()


def get_flags(request, decoded):
    if not configcat_client:
        return {
            "highLowEnabled": False,
            "default": True,
        }
    
    userid = decoded["sub"]

    user_object = User(userid)

    return {
        "highLowEnabled": configcat_client.get_value('highLowEnabled', False, user_object),
        "default": False,
    }


@use_global_exception_handler
@api_view(['GET'])
@requires_scope("profile")
def get_feature_flags(request, decoded):
    return Response(get_flags(request, decoded))

#
# Parameters
#

def get_latest_parameters_or_create_default(userid, date_string):
    try:
        return Parameters.objects.filter(userid=userid).latest("date")
    except ObjectDoesNotExist:
        parameters_serializer = ParametersSerializer(data={
            "userid": userid,
            "date": date_string,
            "balance": 0,
            "set_aside": 0,
        })
        if not parameters_serializer.is_valid():
            logging.error(f"Unable to create initial parameters for new user {userid}")
            raise Exception(f"Unable to create initial parameters for new user {userid}")
        return parameters_serializer.save()


@use_global_exception_handler
@api_view(['GET'])
@requires_scope("profile")
def get_parameters(request, decoded):
    userid = decoded['sub']
    date_string = date.today().strftime("%Y-%m-%d")

    parameters = get_latest_parameters_or_create_default(userid, date_string)
    
    return Response({
        "currentBalance": parameters.balance,
        "setAside": parameters.set_aside,
        "startDate": parameters.date,
    })


def parameters_handler(request):
    if request.method == "GET":
        return get_parameters(request)
    elif request.method == "PUT":
        return put_parameters(request)


@use_global_exception_handler
@api_view(['PUT'])
@requires_scope("profile")
def put_parameters(request, decoded):
    userid = decoded['sub']
    start_date = date.today()
    date_string = start_date.strftime("%Y-%m-%d")

    latest_parameters = get_latest_parameters_or_create_default(userid, date_string)

    body = JSONParser().parse(request)

    parameters_serializer = ParametersSerializer(data={
        "userid": userid,
        "date": date_string,
        "balance": body.get("currentBalance", latest_parameters.balance),
        "set_aside": body.get("setAside", latest_parameters.set_aside),
    })

    if not parameters_serializer.is_valid():
        logging.warn(f"Unable to create parameters for user {userid}")
        return Response(parameters_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        parameters = parameters_serializer.save()
    except IntegrityError:
        # There must already be an entry for today
        # then it must (probably) be the latest
        # so we'll update those
        parameters = parameters_serializer.update(latest_parameters, parameters_serializer.validated_data)

    return Response({
        "currentBalance": parameters.balance,
        "setAside": parameters.set_aside,
        "startDate": parameters.date,
    })

#
# Execute
#


def make_execution_parameters(request, rules) -> ExecutionParameters:
    """
    Extracts execution parameters from request
    """
    start = request.GET.get('startDate', '')
    if start:
        start = dateutil.parser.parse(start).date()
    else:
        start = date.today()
    
    # end
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
        rule_map[rule['id']] = {
            "name": rule["name"],
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


def get_transactions(request, decoded):
    userid = decoded["sub"]

    rules = get_rules_from_database(userid)
    parameters = make_execution_parameters(request, rules)
    context = ExecutionContext(parameters, rules)
    context.assert_valid()  # because we might calculate a new end date

    # Calculate transactions
    transactions = get_transactions_up_to(context)
    results = list(map(lambda i: {
        **i.serialize(),
        "name": rules.rules_map[i.rule_id]["name"]
    }, transactions))
    return results, context


@use_global_exception_handler
@api_view(['GET'])
@requires_scope("transactions:read")
def process_transactions(request, decoded):
    results, context = get_transactions(request, decoded)

    return Response({
        "transactions": results,
        "params": context.serialize(),
    })


@use_global_exception_handler
@api_view(['GET'])
@requires_scope("transactions:read")
def process_daybydays(request, decoded):
    userid = decoded["sub"]

    # Pull out parameters
    rules = get_rules_from_database(userid)
    parameters = make_execution_parameters(request, rules)
    context = ExecutionContext(parameters, rules)
    context.assert_valid()  # because we might calculate a new end date

    # Calculate daybydays
    daybydays = generate_daybydays(context)

    return Response({
        "daybydays": daybydays,
        "params": context.serialize(),
    })


@use_global_exception_handler
@api_view(['GET'])
@requires_scope("transactions:read")
def export_transactions(request, decoded):
    results, context = get_transactions(request, decoded)

    response = HttpResponse(content_type='text/csv')
    fileName = "Transactions." + context.parameters.start.strftime('%Y-%-m-%-d') + "." + context.parameters.end.strftime('%Y-%-m-%-d') + ".csv" 
    response['Content-Disposition'] = 'attachment; filename="' + fileName + '"'

    fieldnames = ['rule_id', 'name', 'value', 'day', 'balance', 'disposable_income']
    writer = csv.DictWriter(response, fieldnames=fieldnames)
    writer.writeheader()

    # Flatten transactions for csv file
    for result in results:
        transaction_dict_flat = {
            "rule_id": result["rule_id"],
            "name": result["name"],
            "value":  result["value"],
            "day":  result["day"],    
            "balance": result["calculations"]["balance"],
            "disposable_income":  result["calculations"]["working_capital"],            
        }
        writer.writerow(transaction_dict_flat)

    return response
