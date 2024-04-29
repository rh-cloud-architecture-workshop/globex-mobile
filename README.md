## Running on Local PC

Run `npm run dev:ssr` for running this as server side app. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


## Env variables needed
Run the globex-store  globex-db images locally and setup these URLs

export API_TRACK_USERACTIVITY="http://localhost:9000/track"
export API_GET_PAGINATED_PRODUCTS="http://localhost:9000/services/catalog/product"
export API_GET_PRODUCT_DETAILS_BY_IDS="http://localhost:9000/services/catalog/product/:ids" 
export API_CATALOG_RECOMMENDED_PRODUCT_IDS="http://localhost:9000/score/product"
export API_CART_SERVICE="http://localhost:9000/services/cart"
export API_CUSTOMER_SERVICE="http://localhost:9000/services/customer/id/:custId"
export API_ORDER_SERVICE="http://localhost:8080/web-gateway/services/order"

export GLOBEX_MOBILE_GATEWAY=<https://globex-mobile-gateway-product-3scale-user1-apicast-production.apps.cluster-xyz.dynamic.redhatworkshops.io:443>
export API_CLIENT_ID=5b76c398
export SSO_AUTHORITY=https://sso.apps.cluster-xyz.dynamic.redhatworkshops.io/realms/globex-user1
export SSO_REDIRECT_LOGOUT_URI=http://localhost:4200/home
export SSO_LOG_LEVEL=2


## docker
podman build . -t quay.io/cloud-architecture-workshop/globex-mobile:<checkin-tag>
podman push quay.io/cloud-architecture-workshop/globex-mobile:<checkin-tag>