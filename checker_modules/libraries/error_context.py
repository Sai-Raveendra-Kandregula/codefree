import os
import linecache

# filepath must be absolute path
def get_error_context(file_path, line_number = 1):
    if os.path.exists(file_path):
        context_line = linecache.getline(file_path, line_number)
        return context_line
    else: 
        return None