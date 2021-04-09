# %%
import os
import pandas as pd
import datetime
import google.protobuf
from collections import Counter

# %%
# Start writing Protocol Buffer 3 Syntax for datetime series data
schema = '''syntax = "proto3";

message Row {
    int64 geoid = 1;

'''

# %%

# Generate a list of dates in the following format in order to populate columns
# dt2020_01_01 ## 'dt' datetime 'YYYY' year 'MM' month 'DD' day
# ProtoBuf doesn't allow hyphens, or starting with a number, so this is the way!
dateColumnList = []
cleanDateList = []

currentDate = datetime.datetime.strptime('01/21/20', "%m/%d/%y")
today = datetime.datetime.strptime(datetime.date.today().strftime("%m/%d/%y"), "%m/%d/%y")

while currentDate <= today:
    cleanDateList.append(currentDate)
    dateColumnList.append(f"dt{currentDate.strftime('%Y-%m-%d').replace('-','_')}")
    currentDate = currentDate + datetime.timedelta(days=1)

# %%

# loop through the generated dates, and build out the schema with positional
# arguments for each column.
# Then, add a repeated message "Rows" that will repeat the data for each county/state

for idx, date in enumerate(dateColumnList):
    schema += f'''int32 {date} = {idx+2}; 
    '''

schema += '''
}

message Rows {
    repeated Row row = 1;
}
'''
# %%

# Dump the schema into a proto file
# There are ways to generate this in python directly, but we will need to make a JS version, too
# So, doing this slightly ham-handed method with a string dump allows us to make a protofile and use it elsewhere
os.remove("dateSchema.proto")
with open(f'dateSchema.proto', 'w') as outfile:
    outfile.write(schema)

# %%
# Generate Python Schema
os.system(f'protoc -I=. --python_out=. longDate.proto')
# protoc --js_out=import_style=commonjs,binary:. myFile.proto
# Generate JS Schema
os.system(f'node pbf/bin/pbf longDate.proto > longDate.js')

# %%
import dateSchema_pb2

fileList = ['covid_testing_cdc']

# %% 
def checkDateSchema(columns):
    isISO = False
    isUS = False
    for column in columns:
        characters = Counter(column)
        if characters['-'] == 2:
            if isISO == True:
                return 'ISO'
            else:
                isISO = True
        if characters['/'] == 2:
            if isUS == True:
                return 'US'
            else:
                isUS = True
# %%
for fileName in fileList:
    csvData = pd.read_csv(f'../../public/csv/{fileName}.csv')
    currColumns = csvData.columns
    dateSchema = checkDateSchema(currColumns)
    if dateSchema == 'ISO':
        stringFormat = '%Y-%m-%d'
    else:
        stringFormat = "%m/%d/%y"

    pbfRows = dateSchema_pb2.Rows()

    for i in range(0, len(csvData)):
        print(i)
        for idx, column in enumerate(dateColumnList):
            
            try:
                currVal = int(csvData.iloc[i][cleanDateList[idx].strftime(stringFormat)])
                row = dateSchema_pb2.Row()
                row.geoid = int(csvData.iloc[i].fips_code)
                row.date = column
                row.value = int(currVal)
                pbfRows.add(row)
            except:
                continue

    print('finished looping')
    f = open('test2.pbf', "wb")
    f.write(pbfRows.SerializeToString())
    f.close()
# %%
