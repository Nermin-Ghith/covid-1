# %%
import pyarrow as pa
import pandas as pd 
from pyarrow import feather
import pyarrow.parquet as pq
import dask.dataframe as dd
# %%
df = pd.read_csv('../../public/csv/covid_testing_cdc.csv')
print(df.dtypes)
# %%

schema = pa.Schema.from_pandas(df)
table = pa.Table.from_pandas(df)
table
# %%

# Note new_file creates a RecordBatchFileWriter 
writer = pa.RecordBatchFileWriter('test.arrow', schema)
writer.write_table(table)
writer.close()

# %%
# write arrow table to a single parquet file, just to test it
pq.write_table(table, 'test.parq')
# %%
ddf = dd.read_parquet('test.parq', index='fips_code')
# %%
ddf
# %%
print('{:,} total records in {} partitions'.format(len(ddf), ddf.npartitions))
print('DataFrame size: {:,}'.format(ddf.size.compute()))
ddf
# %%

# read parquet file with arrow
table = pq.read_table('test.parq')
# %%
table.to_pandas()
# %%
writer = pa.RecordBatchFileWriter('test2.arrow', table.schema)
writer.write_table(table)
writer.close()

# %%
