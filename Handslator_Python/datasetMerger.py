import os
import shutil

'''
###############################################################################
Method which merges the coordinates from different directories and saves then 
into a new directory

arg: names of the directories to be merged, output directory name
return: No real return saves files
###############################################################################
'''

def merge_directories(dir_names, output_dir):
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Loop through each directory
    for dir_name in dir_names:
        # Get the list of files in the current directory
        files = os.listdir(dir_name)

        # Loop through each file in the directory
        for file in files:
            # Create the full path of the current file
            file_path = os.path.join(dir_name, file)

            # Check if the file is not a directory
            if os.path.isfile(file_path):
                # Create the full path for the destination file in the merged directory
                destination_path = os.path.join(output_dir, file)

                # Append the content of the current file to the destination file
                with open(file_path, 'rb') as source_file, open(destination_path, 'ab') as dest_file:
                    shutil.copyfileobj(source_file, dest_file)

# List of directory names to merge
directories_to_merge = ['./Data/ArtificialDataset_Benji', './Data/merged_dir_old']

# Output directory where merged files will be stored
output_directory = './Data/merged_dir'

# Call the function to merge directories
merge_directories(directories_to_merge, output_directory)

print("Files have been successfully merged into the 'merged_dir' directory.")
