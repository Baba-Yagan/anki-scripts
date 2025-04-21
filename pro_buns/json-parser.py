import os
import json
from bs4 import BeautifulSoup

input_directory = "/path/to/html-files"
output_directory = "/path/to/json-files"

os.makedirs(output_directory, exist_ok=True)

for filename in os.listdir(input_directory):
    if filename.endswith(".html"):
        input_path = os.path.join(input_directory, filename)

        output_filename = os.path.splitext(filename)[0] + ".json"
        output_path = os.path.join(output_directory, output_filename)

        with open(input_path, "r", encoding="utf-8") as f:
            html_content = f.read()

        soup = BeautifulSoup(html_content, "html.parser")

        script_tag = soup.find("script", id="__NEXT_DATA__", type="application/json")
        assert script_tag.string is not None, f"{filename}: script tag has no string" # type: ignore[attr-defined]

        json_text = script_tag.string # type: ignore[attr-defined]

        try:
            data = json.loads(json_text)  # type: ignore[attr-defined]
        except json.JSONDecodeError as e:
            print(f"error {filename}: {e}")
            continue

        with open(output_path, "w", encoding="utf-8") as out_file:
            json.dump(data, out_file, ensure_ascii=False, indent=2)

        # be verbose
        print(f"extracted '{filename}' into '{output_filename}'")
