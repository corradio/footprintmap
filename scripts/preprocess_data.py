import json
import math
import re

from datetime import datetime

import pandas as pd
import numpy as np

'''
Create JSON with following structure
{
    "DK": [
        {
            year: 2018,
            totalEmissionsMegatonsCO2: ...,
            totalFootprintMegatonsCO2: ...,
            gdpCurrentUSD: ...,
            population: ...,
            totalEnergyProductionTWh: ...,
            totalPrimaryEnergyConsumptionTWh: ...,
            energyProductionMixTWh: {
                coal: ...,
                ....
            },
            energyConsumptionMixTWh: {
                ...
            },
        },
        ...
    ],
    ...
}
'''
obj = {}

# ** Read csv for country mapping
# Source: https://datahub.io/core/country-list/r/data.csv -> country_mapping.csv
country_mapping = {}
for i, row in pd.read_csv('data/country_mapping.csv')[['Name', 'Code']].iterrows():
    country_mapping[row['Name']] = row['Code']
country_mapping['Namibia'] = 'NA'
country_mapping['North Korea'] = 'KP'
country_mapping['Democratic Republic of the Congo'] = 'CD'
country_mapping['Faeroe Islands'] = 'FO'
country_mapping['Micronesia (Federated States of)'] = 'FM'
country_mapping['Iran'] = 'IR'
country_mapping['Kosovo'] = 'XK'
country_mapping['Laos'] = 'LA'
country_mapping['Macedonia (Republic of)'] = 'MK'
country_mapping['North Macedonia'] = 'MK'
country_mapping['Bolivia'] = 'BO'
country_mapping['South Korea'] = 'KR'
country_mapping['Moldova'] = 'MD'
country_mapping['Saint Helena'] = 'SH'
country_mapping['Syria'] = 'SY'
country_mapping['Taiwan'] = 'TW'
country_mapping['Tanzania'] = 'TZ'
country_mapping['USA'] = 'US'
country_mapping['Venezuela'] = 'VE'
country_mapping['Wallis and Futuna Islands'] = 'WF'
country_mapping['Republic of Congo '] = 'CD'


def get_country_iso2(country_name):
    return country_mapping[country_name]


IGNORED_COUNTRIES = [
    'Bonaire, Saint Eustatius and Saba',
    'British Virgin Islands',
    'Occupied Palestinian Territory',
    'KP Annex B',
    'Non KP Annex B',
    'OECD',
    'Non-OECD',
    'EU28',
    'EU27',
    'Africa',
    'Asia',
    'Central America',
    'Europe',
    'Middle East',
    'North America',
    'Oceania',
    'South America',
    'Bunkers',
    'Statistical Difference',
    'World',
]


def is_valid_country(country_name):
    if country_name in IGNORED_COUNTRIES or 'Unnamed' in country_name:
        return False
    return True


def ensure_year_exists(country_iso2, year):
    if country_iso2 not in obj:
        obj[country_iso2] = {}
    if year not in obj[country_iso2]:
        obj[country_iso2][year] = {}


# ** Read emission data
print('Reading Global Carbon Project..')
filename = 'National_Carbon_Emissions_2021v1.0.xlsx'
df_terr_emissions = pd.read_excel(
    f'data/{filename}',
    sheet_name='Territorial Emissions',
    header=11)
df_terr_emissions = df_terr_emissions.rename(
    columns={df_terr_emissions.columns[0]: 'year'})
# transpose
df_terr_emissions = df_terr_emissions.melt(
    id_vars=['year'],
    var_name='country',
    value_name='territorial_emissions_MtCO2').set_index(['year', 'country'])
# emissions
df_cons_emissions = pd.read_excel(
    f'data/{filename}',
    sheet_name='Consumption Emissions',
    header=8)
df_cons_emissions = df_cons_emissions.rename(
    columns={df_cons_emissions.columns[0]: 'year'})
# transpose
df_cons_emissions = df_cons_emissions.melt(
    id_vars=['year'],
    var_name='country',
    value_name='consumption_emissions_MtCO2').set_index(['year', 'country'])
# merge and convert to tCO2 (multiply MtC by 3.664 - see excel)
df_merged = df_cons_emissions.join(df_terr_emissions) * 3.664
# save
for (year, country_name), row in df_merged.iterrows():
    if not is_valid_country(country_name):
        continue
    country_iso2 = get_country_iso2(country_name)
    if int(year) == 1990:
        if str(country_iso2) == 'nan':
            print(country_iso2, country_name)
            raise Exception(f'country_name {country_name} was converted to nan.')
    ensure_year_exists(country_iso2, year)
    country_year = obj[country_iso2][year]
    if not np.isnan(row['territorial_emissions_MtCO2']):
        country_year['totalEmissionsMegatonsCO2'] = row['territorial_emissions_MtCO2']
    if not np.isnan(row['consumption_emissions_MtCO2']):
        country_year['totalFootprintMegatonsCO2'] = row['consumption_emissions_MtCO2']

# ** Read Worldbank population & gdp data
# https://databank.worldbank.org/reports.aspx?ReportId=108394&Type=Table
# Pick "Population, Total" and "GDP (current US$) and export as excel"
# You should remove all series and then search "SP.POP.TOTL" and "NY.GDP.MKTP.CD"
# Remember to take 1960 -> latest
print('Reading worldbank..')
df_worldbank = pd.read_excel(
    'data/worldbank_gdp_pop.xlsx',
    sheet_name='Data',
    skipfooter=5,
    na_values=['..'])
df_worldbank.columns = [re.sub(r' \[YR\d\d\d\d\]$', '', x) for x in df_worldbank.columns]
to_drop = df_worldbank['Country Name'].apply(lambda k: (type(k) == float and math.isnan(k)) or k in [
    'Channel Islands',
    'Caribbean small states',
    'Early-demographic dividend',
    'Fragile and conflict affected situations',
    'IDA blend',
    'IDA only',
    'IDA total',
    'Late-demographic dividend',
    'Middle income',
    'North America',
    'Not classified',
    'Pacific island small states',
    'Post-demographic dividend',
    'Pre-demographic dividend',
    'Small states',
    'Upper middle income',
] or 'World' in k or 'Euro' in k or 'Asia' in k or 'countries' in k or 'income' in k or 'OECD' in k or 'IBRD' in k or 'Latin America' in k or 'Middle East' in k or 'Other' in k or 'Sub-Saharan Africa' in k)
df_worldbank = df_worldbank.loc[~to_drop]
# Read iso2 to iso3
df_iso2_3 = pd.read_csv('data/countries-iso2-iso3.csv', index_col='iso3', keep_default_na=False)
country_mapping['Congo, Dem. Rep.'] = 'CD'
df_worldbank['country_code'] = df_worldbank \
    .apply(lambda x: df_iso2_3.loc[x['Country Code']].iso2 if x['Country Code'] in df_iso2_3.index else country_mapping[x['Country Name']], axis=1)
df_worldbank_gdp = df_worldbank[df_worldbank['Series Code'] == 'NY.GDP.MKTP.CD'].drop(columns=['Country Code', 'Series Name', 'Series Code', 'Country Name'])
df_worldbank_pop = df_worldbank[df_worldbank['Series Code'] == 'SP.POP.TOTL'].drop(columns=['Country Code', 'Series Name', 'Series Code', 'Country Name'])
df_worldbank_gdp = df_worldbank_gdp.melt(
    id_vars=['country_code'],
    var_name='year',
    value_name='gdp_current_usd')
df_worldbank_pop = df_worldbank_pop.melt(
    id_vars=['country_code'],
    var_name='year',
    value_name='population')
df_worldbank_pop['year'] = df_worldbank_pop['year'].astype(int)
df_worldbank_pop = df_worldbank_pop.set_index(['country_code', 'year'])
df_worldbank_gdp['year'] = df_worldbank_gdp['year'].astype(int)
df_worldbank_gdp = df_worldbank_gdp.set_index(['country_code', 'year'])
df_merged = df_worldbank_gdp.join(df_worldbank_pop)
# save
for (country_iso2, year), row in df_merged.iterrows():
    ensure_year_exists(country_iso2, year)
    country_year = obj[country_iso2][year]
    if not np.isnan(row['gdp_current_usd']):
        country_year['gdpMillionsCurrentUSD'] = row['gdp_current_usd'] / 1e6
    if not np.isnan(row['population']):
        country_year['populationMillions'] = row['population'] / 1e6


# ** Read BP
BP_SKIP_HEADER = 2  # Number of lines to skip
# map countries (BP)
country_mapping['Brunei'] = 'BN'
country_mapping['US'] = 'US'
country_mapping['Trinidad & Tobago'] = 'TT'
country_mapping['North Macedonia'] = 'MK'
country_mapping['China Hong Kong SAR'] = 'HK'
country_mapping['Vietnam'] = 'VN'

TOE_TO_TWH = 1 / 85985


def convert_mtoe_to_twh(f): return f * 1e6 * TOE_TO_TWH  # Mtoe to TWh
def convert_ej_to_twh(f): return f * 277.7778 # EJ to TWh


bp_sheet_mapping = {
    # sheet -> field path
    'Primary Energy Consumption': {'key': 'totalPrimaryEnergyConsumptionTWh', 'convert': convert_ej_to_twh},
    'Electricity Generation ': {'key': 'totalElectricityGenerationTWh'},
    # Note: total primary energy production is not directly accessible

    'Oil Consumption - Tonnes': {'key': 'primaryEnergyConsumptionTWh.oil', 'convert': convert_mtoe_to_twh},
    'Gas Consumption - EJ': {'key': 'primaryEnergyConsumptionTWh.gas', 'convert': convert_ej_to_twh},
    'Coal Consumption - EJ': {'key': 'primaryEnergyConsumptionTWh.coal', 'convert': convert_ej_to_twh},
    'Nuclear Consumption - EJ': {'key': 'primaryEnergyConsumptionTWh.nuclear', 'convert': convert_ej_to_twh},
    'Hydro Consumption - EJ': {'key': 'primaryEnergyConsumptionTWh.hydro', 'convert': convert_ej_to_twh},
    'Solar Consumption - EJ': {'key': 'primaryEnergyConsumptionTWh.solar', 'convert': convert_ej_to_twh},
    'Wind Consumption - EJ': {'key': 'primaryEnergyConsumptionTWh.wind', 'convert': convert_ej_to_twh},
    'Geo Biomass Other - EJ': {'key': 'primaryEnergyConsumptionTWh.biomass', 'convert': convert_ej_to_twh},

    'Oil Production - Tonnes': {'key': 'primaryEnergyProductionTWh.oil', 'convert': convert_mtoe_to_twh},
    'Gas Production - EJ': {'key': 'primaryEnergyProductionTWh.gas', 'convert': convert_ej_to_twh},
    'Coal Production - EJ': {'key': 'primaryEnergyProductionTWh.coal', 'convert': convert_ej_to_twh},
    'Nuclear Generation - TWh': {'key': 'primaryEnergyProductionTWh.nuclear'},
    'Hydro Generation - TWh': {'key': 'primaryEnergyProductionTWh.hydro'},
    'Solar Generation - TWh': {'key': 'primaryEnergyProductionTWh.solar'},
    'Wind Generation - TWh': {'key': 'primaryEnergyProductionTWh.wind'},
    'Geo Biomass Other - TWh': {'key': 'primaryEnergyProductionTWh.biomass'}

    ## TODO: Add biofuels
    ## TODO: Rename biomass to geoAndBiomass
    ## TODO: Count biofuels as renewable
    ## Note: Energy consumption doesn't take into account cross-border import
}
"""
'Biofuels Production - PJ'
'Biofuels Consumption - PJ'
"""
for sheet_name in bp_sheet_mapping.keys():
    print(f'Reading BP {sheet_name}..')
    df_bp = pd.read_excel(
        'data/bp-stats-review-2021-all-data.xlsx',
        sheet_name=sheet_name,
        header=BP_SKIP_HEADER)
    df_bp = df_bp.rename(
        columns={df_bp.columns[0]: 'country'})
    # Remove columns that are not years
    df_bp = df_bp[[x for x in df_bp.columns if type(x) is int or x == 'country']]
    # Remove invalid lines
    rows_to_drop = df_bp.drop('country', axis=1).isna().all(axis=1)
    df_bp = df_bp.loc[~rows_to_drop]
    to_drop = df_bp.country.apply(lambda k: (type(k) == float and math.isnan(k)) or k in [
        'Central America',
        'USSR',
        'Eastern Africa',
        'Middle Africa',
        'Western Africa',
    ] or 'Total' in k or 'Other' in k or 'OECD' in k or 'European Union' in k or 'OPEC' in k)
    df_bp = df_bp.loc[~to_drop]
    # Melt
    df_bp = df_bp.melt(
        id_vars=['country'],
        var_name='year',
        value_name='value')
    df_bp['country_code'] = df_bp['country'].apply(lambda x: country_mapping[x])
    df_bp = df_bp.drop(columns=['country']).set_index(['country_code', 'year'])
    # save
    for (country_iso2, year), row in df_bp.iterrows():
        ensure_year_exists(country_iso2, year)
        country_year = obj[country_iso2][year]
        if not np.isnan(row['value']):
            (*path, key) = bp_sheet_mapping[sheet_name]['key'].split('.')
            for p in path:
                if p not in country_year:
                    country_year[p] = {}
                country_year = country_year[p]
            convert = bp_sheet_mapping[sheet_name].get('convert', lambda f: f)
            country_year[key] = convert(row['value'])


# ** Postprocess
for country_iso2, country_data in obj.items():
    for (year, v) in country_data.items():

        # Compute totals if not already present
        if 'totalPrimaryEnergyProductionTWh' not in v and 'primaryEnergyProductionTWh' in v:
           v['totalPrimaryEnergyProductionTWh'] = sum([d for d in v['primaryEnergyProductionTWh'].values()])

        # do checks
        if 'totalPrimaryEnergyProductionTWh' in v and 'primaryEnergyProductionTWh' in v:
            Z = sum([d for d in v['primaryEnergyProductionTWh'].values()])
            #print('totalPrimaryEnergyProduction', abs(Z - v['totalPrimaryEnergyProductionTWh']))
        if 'totalPrimaryEnergyConsumptionTWh' in v and 'primaryEnergyConsumptionTWh' in v:
            Z = sum([d for d in v['primaryEnergyConsumptionTWh'].values()])
            #print('primaryEnergyConsumption', abs(Z - v['totalPrimaryEnergyConsumptionTWh']))

        if 'totalFootprintMegatonsCO2' in v and 'populationMillions' in v:
            v['totalFootprintTonsCO2PerCapita'] = v['totalFootprintMegatonsCO2'] / v['populationMillions']
        if 'totalEmissionsMegatonsCO2' in v and 'populationMillions' in v:
            v['totalEmissionsTonsCO2PerCapita'] = v['totalEmissionsMegatonsCO2'] / v['populationMillions']

        # kaya
        v['kaya'] = {}
        if 'populationMillions' in v and 'gdpMillionsCurrentUSD' in v:
            v['kaya']['gdpCurrentUSDPerCapita'] = v['gdpMillionsCurrentUSD'] / v['populationMillions']
        if 'totalPrimaryEnergyConsumptionTWh' in v and 'gdpMillionsCurrentUSD' in v:
            v['kaya']['energyIntensityWhPerCurrentUSD'] = (v['totalPrimaryEnergyConsumptionTWh'] * 1e12) / (v['gdpMillionsCurrentUSD'] * 1e6)
        if 'totalFootprintMegatonsCO2' in v and 'totalPrimaryEnergyConsumptionTWh' in v:
            v['kaya']['carbonIntensityGramsCO2PerWh'] = (v['totalFootprintMegatonsCO2'] * 1e6 * 1e6) / (v['totalPrimaryEnergyConsumptionTWh'] * 1e12)

        # add metadata
        v['year'] = year
        v['countryCode'] = country_iso2

# ** Turn dicts into arrays
years = sorted(set([int(year) for year, _ in country_data.items() for country_iso2, country_data in obj.items()]))
for country_iso2, country_data in obj.items():
    obj[country_iso2] = [country_data.get(year) for year in years]

# ** Add targets
targets = {
    'DK': {
        # 'totalEmissionsMegatonsGHG': 0.70 * obj['DK'][1990]['totalEmissionsMegatonsGHG']
    }
}

# ** Write final
with open('../web/src/globalcarbon.json', 'w+') as f:
    json.dump({
        'updatedAt': datetime.now().isoformat(),
        'countries': obj,
        'targets': targets,
    }, f)
