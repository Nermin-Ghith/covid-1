import pyarrow as pa
import pandas as pd 

df = pd.read_parquet('your_file.parquet')

schema = pa.Schema.from_pandas(df, preserve_index=False)
table = pa.Table.from_pandas(df, preserve_index=False)

sink = "myfile.arrow"

# Note new_file creates a RecordBatchFileWriter 
writer = pa.ipc.new_file(sink, schema)
writer.write(table)
writer.close()