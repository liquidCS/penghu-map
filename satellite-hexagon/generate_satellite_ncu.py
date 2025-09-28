import matplotlib.pyplot as plt
import math
from shapely.geometry import  Polygon, box
import sys 
import os 
import argparse
import contextily as cx 
import geopandas as gpd
import json
import time

geojson_file = '../public/penghu_smallHex_grid_bbox_index.geojson'
gdf = gpd.read_file(geojson_file)

for index, row in gdf.iterrows():

    polygon = row['geometry'].convex_hull



    latlng_bbox = json.loads(row['bbox'])

    fig, ax = plt.subplots(1, 1, figsize=(2.56, 2.56))
    fig.set_facecolor('white')
    ax.set_axis_off()

    gdf = gpd.GeoSeries([box(latlng_bbox['minx'], latlng_bbox['miny'], latlng_bbox['maxx'], latlng_bbox['maxy'])], crs="EPSG:4326")
    gdf_3857 = gdf.to_crs(epsg=3857)
    minx, miny, maxx, maxy = gdf_3857.total_bounds

    ax.set_xlim(minx, maxx)
    ax.set_ylim(miny, maxy)
    
    cx.add_basemap(ax, attribution_size=0, source="https://data.csrsr.ncu.edu.tw/SP_PH/SP_latest_NC_PH_3857/{z}/{y}/{x}.png", zoom=18) # Add basemap

    fig.subplots_adjust(left=0, right=1, top=1, bottom=0) # make margin smaller
    plt.savefig(f"./images_ncu/{row['id']}.png")
    plt.close()

    time.sleep(0.5)
