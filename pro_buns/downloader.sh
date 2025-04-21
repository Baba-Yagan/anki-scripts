uagent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0"

url="aHR0cHM6Ly9idW5wcm8uanAvZ3JhbW1hcl9wb2ludHMK"
rooturl="aHR0cHM6Ly9idW5wcm8uanAK"
rooturlx="$(echo "$rooturl" | base64 --decode)"
greptxt="ZGsza2d5bHNncTNrMQo="
host="$(echo "$greptxt" | base64 --decode)"


wget -U "$uagent" -e robots=off "$(echo "$url" | base64 --decode)" -O temp.html
grep -o 'href="/grammar_points/[^"]*"' temp.html | sed 's/href="//; s/"//' > urls.txt
sed -i "s|^|${rooturlx}|" urls.txt

mkdir -p html_files
cd html_files
wget -U "$uagent" -e robots=off -i ../urls.txt
cd ..

echo "edit the path and run json-parser.py"
read -p "waiting..."
cd ./json-files
grep -oP "https://$host[^\"']+" ./* | grep -oP 'https://[^"]+' | sort | uniq > ../audio-urls.txt
cd ..

mkdir -p ./audio-files
cd ./audio-files
wget -U "$uagent" -e robots=off -i ../audio-urls.txt
rm audio-urls.txt
