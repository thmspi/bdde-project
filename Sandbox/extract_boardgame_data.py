#!/usr/bin/env python3
"""
This script reads the first 1,000 non-header rows of 'details.csv'
and generates an SQL file (insert_games.sql) containing multiple
INSERT statements (each with up to 100 rows) for the Game table.
It uses the CSV’s game name and description and randomly assigns
the other values.
"""

import csv
import random

def generate_game_inserts(input_csv="details.csv", output_sql="insert_games.sql", num_rows=1000, batch_size=100):
    batches = []
    current_batch = []
    count = 0

    with open(input_csv, "r", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile)
        header = next(reader)  # Skip header row
        
        for row in reader:
            if count >= num_rows:
                break

            # Assume the first column is the game name and the second column is the description.
            name = row[2].strip().replace("'", "''")
            description = row[3].strip().replace("'", "''")
            
            # Generate random values for additional fields.
            minplayer = random.randint(2, 4)
            maxplayer = random.randint(minplayer, minplayer + 3)
            playingtime = random.randint(30, 120)
            minplaytime = playingtime - random.randint(5, 10)
            maxplaytime = playingtime + random.randint(5, 15)
            average_note = round(random.uniform(5.0, 9.0), 2)
            year_published = random.randint(1950, 2020)
            rank_game = random.randint(1, 20)
            id_publisher = random.randint(1, 10)  # Random publisher ID (assumes 10 publishers)
            id_category = random.randint(1, 15)   # Random category ID (assumes 15 categories)

            sql_row = (
                f"('{name}', '{description}', {minplayer}, {maxplayer}, {playingtime}, "
                f"{minplaytime}, {maxplaytime}, {average_note}, {year_published}, {rank_game}, "
                f"{id_publisher}, {id_category})"
            )
            current_batch.append(sql_row)
            count += 1

            # Once we have reached a batch, save it and start a new one.
            if count % batch_size == 0:
                batches.append(current_batch)
                current_batch = []
        
        # Append any remaining rows as the last batch.
        if current_batch:
            batches.append(current_batch)

    # Write all the batches to the output SQL file.
    with open(output_sql, "w", encoding="utf-8") as sqlfile:
        sqlfile.write("-- Insert sample rows into the Game table in batches\n\n")
        for batch in batches:
            sqlfile.write("INSERT INTO Game (Name_game, Description, minplayer, maxplayer, playingtime, minplaytime, maxplaytime, Average_Note, Year_published, rank_game, id_publisher, Id_category) VALUES\n")
            sqlfile.write(",\n".join(batch))
            sqlfile.write(";\n\n")
    
    print(f"Generated '{output_sql}' with {count} rows in {len(batches)} batches.")

if __name__ == "__main__":
    generate_game_inserts()
