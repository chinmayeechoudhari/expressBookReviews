#!/usr/bin/env bash
# Run after npm install && npm start in a separate terminal.
# Requires curl and Python 3. Logs genuine HTTP responses with their cURL commands.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p evidence
BASE="http://127.0.0.1:5000"
USER_NAME="student_$(date +%s)"
PASS="demoPassword123"
save() {
  local name="$1"; shift
  local cmd=(curl -sS -i "$@")
  printf '%q ' "${cmd[@]}" > "evidence/$name.txt"
  printf '\n\n' >> "evidence/$name.txt"
  "${cmd[@]}" >> "evidence/$name.txt"
  printf '\n' >> "evidence/$name.txt"
  echo "Captured evidence/$name.txt"
}
save githubrepo "https://api.github.com/repos/chinmayeechoudhari/expressBookReviews"
save getallbooks "$BASE/"
save getbooksbyISBN "$BASE/isbn/1"
save getbooksbyauthor "$BASE/author/Jane%20Austen"
save getbooksbytitle "$BASE/title/Pride%20and%20Prejudice"
save getbookreview "$BASE/review/1"
save register -X POST "$BASE/register" -H "Content-Type: application/json" -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASS\"}"
save login -X POST "$BASE/customer/login" -H "Content-Type: application/json" -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASS\"}"
TOKEN=$(curl -sS -X POST "$BASE/customer/login" -H "Content-Type: application/json" -d "{\"username\":\"$USER_NAME\",\"password\":\"$PASS\"}" | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')
save reviewadded -X PUT "$BASE/customer/auth/review/1" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"review":"A remarkable and memorable novel."}'
save deletereview -X DELETE "$BASE/customer/auth/review/1" -H "Authorization: Bearer $TOKEN"
echo "Done: upload or paste the command/output in each evidence/*.txt file."
