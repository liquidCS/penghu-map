import json

with open('result.json', 'r') as file:
    result = json.load(file)

with open('../../public/penghu_smallHex_grid_bbox_index.geojson') as file:
    geojson = json.load(file)


for index, element in enumerate(geojson['features']):
    geojson['features'][index]['properties']['class_result'] = result[element['id']]

with open('../../public/penghu_CNN_class', 'w') as file:
    json.dump(geojson, file)  # 'indent' for pretty printing
