import os
import pandas as pd
import json

dir_path = os.path.dirname(os.path.realpath(__file__))
repo_root = os.path.abspath(os.path.join(dir_path, '..', '..'))

def GetSummary():
    summaryObj = {}
    totalPop = pd.read_csv(os.path.join(repo_root,'data-scripts/cdc/state_populations.csv')).population.sum()
    vaccinationDist = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccine_dist_cdc.csv'))
    vaccinationAdmin1 = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccine_admin1_cdc.csv'))
    vaccinationAdmin2 = pd.read_csv(os.path.join(repo_root, 'public/csv/vaccine_admin2_cdc.csv'))

    summaryObj['vaccineDose1'] = round((vaccinationAdmin1[vaccinationAdmin1.columns[-1]].sum()/totalPop)*100,0)
    summaryObj['vaccineDose2'] = round((vaccinationAdmin2[vaccinationAdmin2.columns[-1]].sum()/totalPop)*100,0)
    summaryObj['vaccineDist'] = round((vaccinationDist[vaccinationDist.columns[-1]].sum()/totalPop)*100,0)

    # fulltime = pd.read_csv(os.path.join(repo_root,'public/csv/daily_pct_fulltime_weekday.csv'))
    # parttime = pd.read_csv(os.path.join(repo_root,'public/csv/daily_pct_parttime_weekday.csv'))
    # home = pd.read_csv(os.path.join(repo_root,'public/csv/daily_pct_home_weekday.csv'))
    fulltime = pd.read_csv('https://raw.githubusercontent.com/nofurtherinformation/covid/main/public/csv/daily_pct_fulltime_weekday.csv')
    parttime = pd.read_csv('https://raw.githubusercontent.com/nofurtherinformation/covid/main/public/csv/daily_pct_parttime_weekday.csv')
    home = pd.read_csv('https://raw.githubusercontent.com/nofurtherinformation/covid/main/public/csv/daily_pct_home_weekday.csv')

    summaryObj['pctFulltime'] = fulltime[fulltime.columns[-1]].median()
    summaryObj['pctParttime'] = parttime[parttime.columns[-1]].median()
    summaryObj['pctHometime'] = home[home.columns[-1]].median()

    healthFactors = pd.read_csv(os.path.join(repo_root, 'public/csv/chr_health_factors.csv'))

    summaryObj['uninsured'] = healthFactors['UnInPrc'].median()
    summaryObj['pcpRatio'] = healthFactors['PrmPhysRt'].str.slice(stop=-2).astype(int, errors="ignore").median()

    with open(os.path.join(repo_root, 'public/json/summary.json'), 'w') as outfile:
        json.dump(summaryObj, outfile)

if __name__ == "__main__":
    GetSummary()