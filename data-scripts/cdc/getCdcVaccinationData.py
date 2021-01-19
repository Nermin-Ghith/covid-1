import os
import pandas as pd
import requests, json
from glob import glob

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def downloadCDCVaccinationData():
    raw = requests.get('https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_data')
    loadedJson = raw.json()['vaccination_data']
    vaccinationData = pd.DataFrame(loadedJson)
    outputDate = loadedJson[0]["Date"].replace('/','-')
    with open(os.path.join(dir_path, f'json/cdc_vaccine_data_{outputDate}.json'), 'w') as outfile:
        json.dump(loadedJson, outfile)

    return glob(os.path.join(dir_path, 'json/*.json'))

def parseVaccinationData(vaccinationDataList):
    geoidTable = pd.read_csv(os.path.join(dir_path, 'statename_geoid.csv'))

    for idx, file in enumerate(vaccinationDataList):
        with open(file) as f:
            data = json.load(f)
            if (type(data)==dict):
                data = data['vaccination_data']
        currDate = data[0]['Date']
        vaccinationDf = pd.DataFrame(data) \
            .merge(geoidTable, left_on="Location", right_on="STUSPS", how="inner")[['GEOID','NAME','Doses_Distributed','Doses_Administered']]

        if idx == 0:
            vaccineAdministered = vaccinationDf[['GEOID','Doses_Administered']]
            vaccineDistributed = vaccinationDf[['GEOID','Doses_Distributed']]
            vaccineAdministered.columns = ['fips',currDate]
            vaccineDistributed.columns = ['fips',currDate]
        else:
            dailyVaccineAdministered = vaccinationDf[['GEOID','Doses_Administered']]
            dailyVaccineDistributed = vaccinationDf[['GEOID','Doses_Distributed']]
            dailyVaccineAdministered.columns = ['fips',currDate]
            dailyVaccineDistributed.columns = ['fips',currDate]

            vaccineAdministered = vaccineAdministered.merge(dailyVaccineAdministered, on=["fips"])
            vaccineDistributed = vaccineDistributed.merge(dailyVaccineDistributed, on=["fips"])

    return { 'vaccineAdministered': vaccineAdministered, 'vaccineDistributed': vaccineDistributed }

if __name__ == "__main__":
    fileList = downloadCDCVaccinationData()
    parsedData = parseVaccinationData(fileList)

    # parsedData['vaccineDistributed'].to_csv('./csv/vaccine_dist_cdc.csv', index=False)
    parsedData['vaccineDistributed'].to_csv(os.path.join(repo_root, 'docs/csv/vaccine_dist_cdc.csv'), index=False)
    # parsedData['vaccineAdministered'].to_csv('./csv/vaccine_admin_cdc.csv', index=False)
    parsedData['vaccineAdministered'].to_csv(os.path.join(repo_root, 'docs/csv/vaccine_admin_cdc.csv'), index=False)
