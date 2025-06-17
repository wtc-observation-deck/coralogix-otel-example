#!/bin/bash

# Help function
show_help() {
  echo "Usage: $0 [OPTIONS]"
  echo "Send GraphQL mutation to add an item to a basket"
  echo ""
  echo "Options:"
  echo "  -u, --user-id USER_ID   Specify user ID (default: random 4-digit number)"
  echo "  -s, --sku SKU           Specify SKU (default: random 6-digit number)"
  echo "  -b, --basket-id ID      Specify basket ID (default: random 5-digit number)"
  echo "  -c, --count COUNT       Number of requests to send (default: 1)"
  echo "  -h, --help              Show this help message"
  echo ""
  echo "Example: $0 --user-id 1234 --count 3"
}

# Default values
USER_ID=""
SKU=""
BASKET_ID=""
COUNT=1

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--user-id)
      USER_ID="$2"
      shift 2
      ;;
    -s|--sku)
      SKU="$2"
      shift 2
      ;;
    -b|--basket-id)
      BASKET_ID="$2"
      shift 2
      ;;
    -c|--count)
      COUNT="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Generate random values if not provided
[[ -z "$USER_ID" ]] && USER_ID=$(printf "%04d" $((RANDOM % 10000)))
[[ -z "$SKU" ]] && SKU=$(printf "%06d" $((RANDOM % 1000000)))
[[ -z "$BASKET_ID" ]] && BASKET_ID=$(printf "%05d" $((RANDOM % 100000)))

# Define server URL
SERVER_URL="http://localhost:3666/graphql"

# Define GraphQL query
QUERY='
mutation addtoCart($sku: String!, $basketId: String!, $userId: String!) {
  addToBasket(sku: $sku, basketId: $basketId, userId: $userId) {
    message
    success
  }
}
'

# Function to send a single request
send_request() {
  local user_id=$1
  local sku=$2
  local basket_id=$3
  
  # Define variables
  local VARIABLES="{
    \"sku\": \"$sku\",
    \"basketId\": \"$basket_id\",
    \"userId\": \"$user_id\"
  }"
  
  # Combine query and variables into a JSON payload
  local PAYLOAD=$(cat <<EOF
{
  "query": $(echo "$QUERY" | jq -Rs .),
  "variables": $VARIABLES
}
EOF
  )
  
  echo "Sending GraphQL request to $SERVER_URL"
  echo "Parameters: userId=$user_id, basketId=$basket_id, sku=$sku"
  
  # Send the request using curl
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-operation-name: addtoCart" \
    -d "$PAYLOAD" \
    "$SERVER_URL" | jq .
    
  echo "Request completed at $(date)"
  echo "-----------------------------------"
}

# Execute the requests
for ((i=1; i<=$COUNT; i++)); do
  # Generate new random values for each request if count > 1
  if [ $COUNT -gt 1 ]; then
    # Keep the same user ID but generate new SKU and basket ID for each request
    current_sku=$(printf "%06d" $((RANDOM % 1000000)))
    current_basket_id=$(printf "%05d" $((RANDOM % 100000)))
  else
    current_sku=$SKU
    current_basket_id=$BASKET_ID
  fi
  
  echo "Request $i of $COUNT"
  send_request "$USER_ID" "$current_sku" "$current_basket_id"
  
  # Add a small delay between requests if sending multiple
  if [ $COUNT -gt 1 ] && [ $i -lt $COUNT ]; then
    sleep 0.5
  fi
done
