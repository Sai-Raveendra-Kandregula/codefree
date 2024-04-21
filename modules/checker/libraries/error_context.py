import os
import re
import linecache

# filepath must be absolute path
def get_error_context(file_path, line_number = 1):
    if os.path.exists(file_path):
        context_line = linecache.getline(file_path, line_number)
        return context_line.strip('\n')
    else: 
        return None

def get_error_symbol(file_path, line_number = 1, column_number = 1):
    if os.path.exists(file_path) and column_number > 0:
        context_line = linecache.getline(file_path, line_number)

        if context_line[column_number-1] != '"': 
            # Define the C Identifier regex pattern
            pattern = r'[a-zA-Z_][a-zA-Z0-9_]*'

            sym_start = context_line[column_number-1:]

            match = re.search(pattern, sym_start)

            # Extract the matched C Identifier
            if match:
                c_identifier = match.group()
                return c_identifier.strip('\n')
    return None