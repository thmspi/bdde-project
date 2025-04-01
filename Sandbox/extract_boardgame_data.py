
import pandas as pd
import ast

# Load data
ratings = pd.read_csv("ratings.csv")
details = pd.read_csv("details.csv")

# Merge on 'id'
merged = pd.merge(details, ratings, on='id')

# Clean up helper function for list-like string fields
def parse_list_field(field):
    try:
        parsed = ast.literal_eval(field)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed]
        else:
            return []
    except:
        return []

# -------------------- Category Table --------------------
# Extract unique categories
details['boardgamefamily'] = details['boardgamefamily'].fillna("[]")
category_set = set()
for item in details['boardgamefamily']:
    category_set.update(parse_list_field(item))
category_df = pd.DataFrame(sorted(category_set), columns=["Name_category"])

# -------------------- Publisher Table --------------------
details['boardgamepublisher'] = details['boardgamepublisher'].fillna("[]")
publisher_set = set()
for item in details['boardgamepublisher']:
    publisher_set.update(parse_list_field(item))
publisher_df = pd.DataFrame(sorted(publisher_set), columns=["boardgamefamily_"])

# -------------------- Game Table --------------------
# Create mapping from names to IDs
publisher_df['id_publisher'] = publisher_df.index + 1
category_df['Id_category'] = category_df.index + 1

# Functions to map game to first publisher/category ID
def get_first_id(value, mapping):
    items = parse_list_field(value)
    return mapping.get(items[0]) if items else None

publisher_map = dict(zip(publisher_df['boardgamefamily_'], publisher_df['id_publisher']))
category_map = dict(zip(category_df['Name_category'], category_df['Id_category']))

merged['id_publisher'] = details['boardgamepublisher'].map(lambda x: get_first_id(x, publisher_map))
merged['Id_category'] = details['boardgamefamily'].map(lambda x: get_first_id(x, category_map))

game_df = merged[[
    'primary', 'description', 'minplayers', 'maxplayers', 'playingtime',
    'minplaytime', 'maxplaytime', 'average', 'yearpublished', 'rank',
    'id_publisher', 'Id_category'
]].copy()

game_df.columns = [
    'Name_game', 'Description', 'minplayer', 'maxplayer', 'playingtime',
    'minplaytime', 'maxplaytime', 'Average_Note', 'Year_published', 'rank_game',
    'id_publisher', 'Id_category'
]

# Save to CSV
category_df.to_csv("Category.csv", index=False)
publisher_df.to_csv("Boardgamepublisher.csv", index=False)
game_df.to_csv("Game.csv", index=False)
