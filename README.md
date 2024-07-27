# oauth-example
This is just example of oauth using nodejs and ory-hydra.

# Install
    1. Go to auth-server 
    2. open terminal and run `docker-compose up`
    3. create a new client using below command
    
```
    curl -X POST 'http://localhost:5445/clients' -H 'Content-Type: application/json' --data-raw '{
        "client_id": "nodeApp",
        "client_name": "nodeApp",
        "client_secret": "someSecret",
        "grant_types": ["authorization_code", "refresh_token"],
        "redirect_uris": ["http://localhost:9010/callback"],
        "response_types": ["code", "id_token"],
        "scope": "offline users.write users.read users.edit users.delete",
        "token_endpoint_auth_method": "client_secret_basic"
    }'
```
    4. copy .env.example to .env in both apps
    5.  npm install and run both apps.

## HOW TO RUN
    - Run docker compose up in auth-server folder
        `docker compose up --build`


## How to Test 
    - oauthkeepr reverse proxy with authorization
    
    - GO TO: http://localhost:9010/
        - enter test login credentails and finish flow
        - copy access token and pass in below API.
    - http://localhost:8001/fake-users, 
        - headers:
                - token: {token}