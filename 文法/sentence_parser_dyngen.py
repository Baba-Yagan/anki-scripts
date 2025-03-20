import json
import re
import os
import glob
import argparse
import csv
from bs4 import BeautifulSoup

def convert_furigana(text):
    """Convert inline furigana notation into proper ruby markup."""
    soup = BeautifulSoup(text, 'html.parser')
    for text_node in soup.find_all(string=True):
        if text_node.parent.name in ['script', 'style']:
            continue
        if '（' in text_node and '）' in text_node:
            new_text = re.sub(
                r'([^（）\s]+)（([^）]+)）',
                lambda m: f"<ruby>{m.group(1)}<rt>{m.group(2)}</rt></ruby>",
                text_node
            )
            if new_text != text_node:
                text_node.replace_with(BeautifulSoup(new_text, 'html.parser'))
    return str(soup)

def extract_mp3_links(data):
    """Extract MP3 links from the JSON data."""
    mp3_links = []
    for key, value in data.items():
        if isinstance(value, str) and value.endswith('.mp3'):
            filename = re.search(r'([^/]+\.mp3)$', value)
            if filename:
                mp3_links.append(filename.group(1))
    return mp3_links

def convert_mp3_to_ogg(mp3_list):
    """Convert .mp3 filenames to .ogg filenames."""
    return [filename.replace('.mp3', '.ogg') for filename in mp3_list]

def escape_inner_quotes(obj):
    """Recursively replace double quotes with \\\" and single quotes with \\\' in string values."""
    if isinstance(obj, dict):
        return {k: escape_inner_quotes(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [escape_inner_quotes(item) for item in obj]
    elif isinstance(obj, str):
        return obj.replace('"', '\\\"').replace("'", "\\\\'")
    else:
        return obj


def remove_newlines(obj):
    """Recursively remove newlines from string values in dictionaries or lists."""
    if isinstance(obj, dict):
        return {k: remove_newlines(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [remove_newlines(item) for item in obj]
    elif isinstance(obj, str):
        return obj.replace('\n', ' ').replace('\r', ' ')
    else:
        return obj

def process_file(file_path, writer):
    """Process a single JSON file and write extracted data as TSV rows."""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    questions_data = data['props']['pageProps']['included']['studyQuestions']
    lesson_id = data['props']['pageProps']['reviewable']['lesson_id']

    batch_data = {
        "questions": {},
        "full_answers": {},
        "requested": {},
        "hints": {},
        "audio_files": {},
        "translation": {},
        "lesson_id": lesson_id
    }

    for idx, entry in enumerate(questions_data):
        if entry.get('answer', "") != "":
            question = convert_furigana(entry['content'])
            raw_question = convert_furigana(entry['content'])
            answer = entry['answer']
            full_answer = re.sub(
                r'<span class="study-area-input">.*?</span>',
                f'<span class="highlight_answer">{answer}</span>',
                raw_question
            )
            match = re.search(r"<strong>(.*?)</strong>", entry['translation'])
            hint = match.group(1) if match else ""
            audio = convert_mp3_to_ogg(extract_mp3_links(entry))
            translation = entry.get('translation', "")

            batch_data["questions"][str(idx)] = question
            batch_data["full_answers"][str(idx)] = full_answer
            batch_data["requested"][str(idx)] = answer
            batch_data["hints"][str(idx)] = hint
            batch_data["audio_files"][str(idx)] = audio
            batch_data["translation"][str(idx)] = translation

    questions_json    = json.dumps(remove_newlines(escape_inner_quotes(batch_data["questions"])), ensure_ascii=False)
    full_answers_json = json.dumps(remove_newlines(escape_inner_quotes(batch_data["full_answers"])), ensure_ascii=False)
    requested_json    = json.dumps(remove_newlines(escape_inner_quotes(batch_data["requested"])), ensure_ascii=False)
    hints_json        = json.dumps(remove_newlines(escape_inner_quotes(batch_data["hints"])), ensure_ascii=False)
    audio_files_json  = json.dumps(remove_newlines(escape_inner_quotes(batch_data["audio_files"])), ensure_ascii=False)
    translation_json  = json.dumps(remove_newlines(escape_inner_quotes(batch_data["translation"])), ensure_ascii=False)
    lesson_id_json    = json.dumps(batch_data["lesson_id"], ensure_ascii=False)

    writer.writerow([
        questions_json,
        full_answers_json,
        requested_json,
        hints_json,
        audio_files_json,
        translation_json,
        lesson_id_json
    ])

def main(input_folder, output_file):
    json_files = glob.glob(os.path.join(input_folder, "*.json"))

    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerow(["questions", "full_answers", "requested", "hints", "audio_files", "translation", "lesson_id"])

        for json_file in json_files:
            process_file(json_file, writer)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract JSON fields and save as TSV for Anki import.")
    parser.add_argument("input_folder", help="Path to the folder containing JSON files.")
    parser.add_argument("output_file", help="Path to the output TSV file.")
    args = parser.parse_args()

    main(args.input_folder, args.output_file)
