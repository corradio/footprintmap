#!/bin/bash
set -eu -o pipefail

# Download 10m in order to get smaller states like AU.CT
RESOLUTION=10m
COUNTRIES_FILENAME=ne_${RESOLUTION}_admin_0_map_subunits

NODE_MODULES_PATH="node_modules/.bin"

mkdir -p build

if [ ! -e "build/${COUNTRIES_FILENAME}.zip" ]; then
  echo "Downloading ${COUNTRIES_FILENAME}.zip"
  curl -z build/${COUNTRIES_FILENAME}.zip -o build/${COUNTRIES_FILENAME}.zip https://naciscdn.org/naturalearth/${RESOLUTION}/cultural/${COUNTRIES_FILENAME}.zip
fi
unzip -od build build/${COUNTRIES_FILENAME}.zip

# Move 3rd party shapes to build
cp -r third_party_maps/* build

# Extract metadata
echo "Extract metadata"
("$NODE_MODULES_PATH/shp2json" -n build/${COUNTRIES_FILENAME}.shp \
  | "$NODE_MODULES_PATH/ndjson-map" 'd.properties' \
)> build/world_countries_props.json

("$NODE_MODULES_PATH/shp2json" -n build/Canary_Islands.shp \
  | "$NODE_MODULES_PATH/ndjson-map" 'd.properties' \
)> build/third_party_props.json

# We could use a country filter here to remove unneeded natural earth shapes.
# Parse countries
echo 'Parsing countries..'
("$NODE_MODULES_PATH/shp2json" -n build/${COUNTRIES_FILENAME}.shp \
  | "$NODE_MODULES_PATH/ndjson-map" '(d.id = (d.properties.ISO_A3 != "-99") ? d.properties.ISO_A3 : d.properties.ADM0_A3, d.oldProps = d.properties, d.properties = {}, d.properties.subid = d.oldProps.SU_A3, d.properties.code_hasc = d.oldProps.code_hasc, delete d.oldProps, d)' \
  | "$NODE_MODULES_PATH/ndjson-filter" "d.id" \
)> build/tmp_countries.json

# Generate final geometries
node generate-geometries.js

echo 'Done'
