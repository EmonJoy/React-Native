
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

url = "http://127.0.0.1:8000/api/signup/"

payload = {
    "username": "testuser02",
    "email": "testuser02@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
}

request = Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urlopen(request) as response:
        print("Status:", response.status)
        print(response.read().decode("utf-8"))
except HTTPError as error:
    print("Status:", error.code)
    print(error.read().decode("utf-8"))
