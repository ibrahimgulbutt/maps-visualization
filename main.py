import pandas as pd

# Dictionary mapping country names to their correct latitude and longitude
country_coords = {
    'Norway': (60.4720, 8.4689),
    'Spain': (40.4637, -3.7492),
    'Italy': (41.8719, 12.5674),
    'France': (46.6034, 1.8883),
    'Chile': (-35.6751, -71.5430),
    'Sudan': (12.8628, 30.2176),
    'Islamic Republic of Iran': (32.4279, 53.6880),
    'Azerbaijan': (40.1431, 47.5769),
    'Netherlands': (52.1326, 5.2913),
    'Australia': (-25.2744, 133.7751),
    'United States of America': (37.0902, -95.7129),
    'Qatar': (25.3548, 51.1839),
    'Egypt': (26.8206, 30.8025),
    'Belgium': (50.5039, 4.4699),
    'Malaysia': (4.2105, 101.9758),
    'Singapore': (1.3521, 103.8198),
    'Maldives': (3.2028, 73.2207),
    'Saudi Arabia': (23.8859, 45.0792),
    'Germany': (51.1657, 10.4515),
    'Uzbekistan': (41.3775, 64.5853),
    'Indonesia': (-0.7893, 113.9213),
    'Kazakhstan': (48.0196, 66.9237),
    'Bahrain': (26.0667, 50.5577),
    'Japan': (36.2048, 138.2529),
    'Ethiopia': (9.1450, 40.4897),
    'Canada': (56.1304, -106.3468),
    'Malta': (35.9375, 14.3754),
    'Sri Lanka': (7.8731, 80.7718),
    'Morocco': (31.7917, -7.0926),
    'Austria': (47.5162, 14.5501),
    'Mauritania': (21.0079, -10.9408),
    'ROC (Republic of China - Taiwan)': (23.6978, 120.9605),
    'Libya': (26.3351, 17.2283),
    'Nauru': (-0.5228, 166.9315),
    'Switzerland': (46.8182, 8.2275),
    'South Africa': (-30.5595, 22.9375),
    'Guyana': (4.8604, -58.9302),
    'Georgia': (42.3154, 43.3569),
    'Portugal': (39.3999, -8.2245),
    'Jordan': (30.5852, 36.2384),
    'Palestine': (31.9522, 35.2332),
    'India': (20.5937, 78.9629),
    'Cyprus': (35.1264, 33.4299),
    'Nigeria': (9.0820, 8.6753),
    'Tunisia': (33.8869, 9.5375),
    'Mexico': (23.6345, -102.5528),
    'Colombia': (4.5709, -74.2973),
    'El Salvador': (13.7942, -88.8965),
    'Romania': (45.9432, 24.9668),
    'Poland': (51.9194, 19.1451),
    'Federated States of Micronesia': (7.4256, 150.5508),
    'Brazil': (-14.2350, -51.9253),
    'Turkey': (38.9637, 35.2433),
    'Sweden': (60.1282, 18.6435),
    'Great Britain': (55.3781, -3.4360),
    'Hungary': (47.1625, 19.5033),
    'Lithuania': (55.1694, 23.8813),
    'Puerto Rico': (18.2208, -66.5901),
    'Angola': (-11.2027, 17.8739),
    'Congo': (-4.0383, 21.7587),
    'Monaco': (43.7384, 7.4246),
    'Rwanda': (-1.9403, 29.8739),
    'Kenya': (-1.2921, 36.8219),
    'Armenia': (40.0691, 45.0382),
    'Samoa': (-13.7590, -172.1046),
    'Brunei Darussalam': (4.5353, 114.7277),
    'Bangladesh': (23.6850, 90.3563),
    'Benin': (9.3077, 2.3158),
    'Côte d\'Ivoire': (7.5399, -5.5471),
    'Trinidad and Tobago': (10.6918, -61.2225),
}

# Load the CSV file
file_path = r'C:\Users\DeLL\Desktop\data-vis\data\Olympics2021\MergedData.csv'
data = pd.read_csv(file_path)

# Function to replace latitude and longitude with correct values from the dictionary
def replace_lat_long(row):
    country = row['Country Code']
    if country in country_coords:
        row['Latitude'], row['Longitude'] = country_coords[country]
    return row

# Apply the function to each row
updated_data = data.apply(replace_lat_long, axis=1)

# Save the updated data back to the CSV
updated_data.to_csv(r'C:\Users\DeLL\Desktop\data-vis\data\Olympics2021\Updated_MergedData.csv', index=False)

print("Latitude and Longitude updated successfully.")
