#!bin/bash
export GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"
git config --global user.email "theuscovidatlas@gmail.com"
git config --global user.name "theuscovidatlas"

cd /tmp/covid/data-scripts/testing

python states_update_testing.py

Rscript /tmp/covid/data-scripts/testing/states_process_testing.R

python s3_upload.py

cd /tmp/covid

git add ./docs/csv/covid_ccpt_1p3a_state.csv \
        ./docs/csv/covid_tcap_1p3a_state.csv \
        ./docs/csv/covid_wk_pos_1p3a_state.csv \
        ./docs/csv/covid_testing_1p3a_state.csv

git commit -m"Updated: `date +'%Y-%m-%d %H:%M:%S'`"&& git push
# python s3_upload.py
