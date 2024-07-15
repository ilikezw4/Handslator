import os
import random
import numpy as np

'''
###############################################################################
Program to create artificial datasets from read in datasets

Uses noises to create the new data
###############################################################################
'''

# Directory containing the files
directory_path = "Data/TMP"

# Loop through files in the directory
for filename in os.listdir(directory_path):
    file_path = os.path.join(directory_path, filename)
    print(file_path)

    # Check if the path points to a file
    if os.path.isfile(file_path):
        # Read all lines from the file
        with open(file_path, 'r') as file:
            lines = file.readlines()

        # Convert lines to a NumPy array
        data = np.array([list(map(int, line.rstrip().split(','))) for line in lines])

        modified_values = []
        # Generate modified data points
        for _ in range(1300000):
            if _ % 65000 == 0:
                print(".", end="")

            # Randomly select a line from the original data
            temp_values = random.choice(data)
            # Create a copy to avoid modifying the original data
            temp_values = temp_values.copy()

            # Add random noise to each coordinate
            noise1a2 = random.uniform(-5, 5)
            noise3 = random.uniform(-0.1, 0.1)

            # Modify every third value in the selected line
            for i in range(2, len(temp_values) - 3, 3):
                temp_values[i] += noise1a2
                temp_values[i + 1] += noise1a2
                temp_values[i + 2] += noise3

            # Append the modified data point to the list
            modified_values.append(temp_values)

        # Save modified_values into a new file
        output_file_path = f"Data/merged_dir/{filename}"  # Output file path (modify as needed)
        with open(output_file_path, 'w') as output_file:
            # Write each modified data point to the new file
            for values in modified_values:
                output_file.write(','.join(map(str, values)) + '\n')

        print(f"\nProcessed file: {filename}, Saved modified values to: {output_file_path}")
