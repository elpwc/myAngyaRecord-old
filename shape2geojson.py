import geopandas as gpd
import os

shapefile_path = "C:/Users/elpwc/Desktop/numazu/numazu_ooaza.shp"
geojson_path = "C:/Users/elpwc/Desktop/numazu/output.geojson"

filename = os.path.splitext(os.path.basename(shapefile_path))[0]
gdf = gpd.read_file(shapefile_path)

gdf['filename'] = filename

gdf.to_file(geojson_path, driver="GeoJSON")