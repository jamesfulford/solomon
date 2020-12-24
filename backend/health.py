import sys
import requests


try:
    requests.get("http://localhost:8000/api/ping").raise_for_status()
except Exception as e:
    print(e)
    sys.exit(1)
