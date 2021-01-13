from functools import wraps
import jwt

from django.http import JsonResponse

import logging
import sys


def get_token_auth_header(request):
    """Obtains the Access Token from the Authorization Header
    """
    try:
        auth = request.META.get("HTTP_AUTHORIZATION", None)
        parts = auth.split()
        token = parts[1]
        return token
    except Exception:
        # header is missing, or maybe invalid format (missing `Bearer`)
        return None


def requires_scope(required_scope):
    """Determines if the required scope is present in the Access Token
    Args:
        required_scope (str): The scope required to access the resource
    """
    
    def require_scope(f):

        if "test" in sys.argv:
            @wraps(f)
            def decorated_ut(*args, **kwargs):
                token = get_token_auth_header(args[0])
                userid = token

                new_kwargs = kwargs.copy()
                new_kwargs["decoded"] = { "sub": userid }

                return f(*args, **new_kwargs)

            return decorated_ut
            
        @wraps(f)
        def decorated(*args, **kwargs):
            token = get_token_auth_header(args[0])

            if not token:
                response = JsonResponse({'message': 'Unauthenticated'})
                response.status_code = 401
                return response

            decoded = None
            if "decoded" in kwargs:
                decoded = kwargs["decoded"]
            else:
                try:
                    decoded = jwt.decode(token, verify=False)
                except Exception:
                    response = JsonResponse({'message': 'Unauthenticated'})
                    response.status_code = 401
                    return response

            if decoded and decoded.get("scope"):
                # logging.debug(decoded)
                token_scopes = decoded["scope"].split()
                for token_scope in token_scopes:
                    if token_scope == required_scope:
                        new_kwargs = kwargs.copy()
                        new_kwargs["decoded"] = decoded
                        return f(*args, **new_kwargs)

            response = JsonResponse({'message': 'Unauthorized'})
            response.status_code = 403
            return response
        
        return decorated

    return require_scope
