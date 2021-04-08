# %%
import os
import pandas as pd
import datetime
import google.protobuf
from collections import Counter

# %%
import flatData_pb2

fileList = ['covid_testing_cdc']


# %%
for fileName in fileList:
    csvData = pd.read_csv(f'../../public/csv/{fileName}.csv')
    dataOut = flatData_pb2.Rows()
    dataOut.dates.extend(list(csvData.columns[1:]))

    rowObj = {}
    for i in range(0, len(csvData)):
        rowObj[i] = dataOut.row.add()
        rowObj[i].geoid = int(csvData.iloc[i].fips_code)
        rowObj[i].vals.extend([int(val) for val in list(csvData.iloc[i].values)[1:]])

    print('finished looping')
    f = open('test3.pbf', "wb")
    f.write(dataOut.SerializeToString())
    f.close()