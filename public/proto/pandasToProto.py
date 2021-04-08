# %%
import os
import pandas as pd
import datetime
import google.protobuf

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

currentDate = datetime.datetime.strptime('01/21/20', "%m/%d/%y")
today = datetime.datetime.strptime(datetime.date.today().strftime("%m/%d/%y"), "%m/%d/%y")

while currentDate <= today:
    dateColumnList.append(f"dt{currentDate.strftime('%Y-%m-%d').replace('-','_')}")
    currentDate = currentDate + datetime.timedelta(days=1)

# %%

# loop through the generated dates, and build out the schema with positional
# arguments for each column.
# Then, add a repeated message "Rows" that will repeat the data for each county/state

for idx, date in enumerate(dateColumnList):
    schema += f'''optional float {date} = {idx+2}; 
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
with open(f'dateSchema.proto', 'w') as outfile:
    outfile.write(schema)
# %%

# %%
# Generate Python Schema
os.system(f'protoc -I=. --python_out=. dateSchema.proto --experimental_allow_proto3_optional')
# Generate JS Schema
os.system(f'node pbf/bin/pbf dateSchema.proto > dateSchema.js')

# %%
# import py schema

import dateSchema_pb2
# %%
print(dateSchema_pb2)
# %%
