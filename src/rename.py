import os
import random
import string

# Generate a new name with the format "XXX-YYYY"
def generate_new_name():
    prefix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=3))
    suffix = ''.join(random.choices(string.digits, k=4))
    return f"{prefix}-{suffix}"

# Rename files in the directory
def rename_files(directory):
    for filename in os.listdir(directory):
        if filename.endswith(('.jpg', '.gif', '.bmp', '.png','.jpeg')):
            new_name = generate_new_name() + os.path.splitext(filename)[1]
            old_file = os.path.join(directory, filename)
            new_file = os.path.join(directory, new_name)
            os.rename(old_file, new_file)
            print(f'Renamed: {filename} -> {new_name}')

# Specify the directory containing the images
directory_path = '.'
rename_files(directory_path)
