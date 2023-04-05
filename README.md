## Running locally

npm run dev:ssr

## Env variables needed

<!-- Signup on Developer portal to get the following 3 values - to authenticate call to 3scale protectedd end points-->
export API_CLIENT_ID="abcsdfg" 

export SSO_AUTHORITY="https://keycloak-redhatssonew.apps.jaya.local.sandbox1316.opentlc.com/auth/realms/globex-user1"
export SSO_REDIRECT_LOGOUT_URI="http://localhost:4200"
export SSO_LOG_LEVEL=2



<!-- partner-gateway URL -->
export GLOBEX_MOBILE_GATEWAY=https://mobileapi-user1-3scale-apicast-staging.apps.jaya.local.sandbox1316.opentlc.com:443
export API_GET_CATEGORY_LIST=http://localhost:8080/services/catalog/category/list
<!-- needed to run docker image -->
NODE_ENV=prod
PORT=8080

## docker
docker build . -t	quay.io/globex-recommendation/globex-recommendation-ui:<checkin-tag>
docker push quay.io/globex-recommendation/globex-recommendation-ui:<checkin-tag>
