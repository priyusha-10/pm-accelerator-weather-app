import sqlite3

try:
    conn = sqlite3.connect('weather.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(weather_history)")
    columns = cursor.fetchall()
    print("Columns in weather_history:")
    for col in columns:
        print(col)
    conn.close()
except Exception as e:
    print(f"Error: {e}")
