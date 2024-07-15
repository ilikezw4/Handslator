import os
import numpy as np
from matplotlib import pyplot as plt
from sklearn.metrics import confusion_matrix
from tensorflow.python.keras.models import load_model
import seaborn as sns

'''
###############################################################################
Creates the target array, e.g. for A its only zeros, for B its ones ...

arg: Length of the needed array, index of the letter
return: Array with given length and filled with one number
###############################################################################
'''

def create_target_array(data_length, index):
    # Function to create the target array (0-23) of the same length as data
    return np.full(data_length, index, dtype=np.int32)


'''
###############################################################################
Reads the coordinates from the file

arg: filename
return: returns numpy array with the coordinates from the file
###############################################################################
'''

def read_data_from_file(filename):
    # Function to read data from files
    with open(filename, "r") as file:
        data = []
        for line in file.readlines():
            line = line.rstrip('\n')
            data.append([int(x) for x in line.split(',')])
    return np.array(data)


'''
###############################################################################
Creates the confusion matrices

arg: directory to get the coordinates from, the path to the model to use, array with the labels from A to Z
return: No real return(Saves images to the ./Data directory)
###############################################################################
'''

def create_confusion_matrix(directory, model_path, class_names):
    # Function to create and save the confusion matrix plot

    # Initialize arrays to accumulate data and labels
    X_all = np.array([])
    y_all = np.array([])

    # Iterate through each file in the directory
    for idx, fileOrig in enumerate(os.listdir(directory)):
        filename = os.path.join(directory, fileOrig)

        # Read data from file
        data = read_data_from_file(filename)

        # Create feature (X) and target (y) arrays
        X = data
        y = create_target_array(len(data), idx)

        # Accumulate data and labels
        if X_all.size == 0:
            X_all = X
            y_all = y
        else:
            X_all = np.concatenate((X_all, X))
            y_all = np.concatenate((y_all, y))

    # Load the trained model
    model = load_model(model_path, compile=False)

    # Prepare test data
    x_test = X_all
    y_test = y_all

    # Predict labels using the model
    y_prediction = model.predict(x_test)
    y_prediction = np.argmax(y_prediction, axis=1)
    print(y_test)
    print(y_prediction)

    # Calculate the confusion matrix
    conf_matrix = confusion_matrix(y_test, y_prediction)

    # Plotting the confusion matrix with labels
    plt.figure(figsize=(16, 12))
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names)
    plt.xlabel('Predicted Labels')
    plt.ylabel('True Labels')
    plt.title('Confusion Matrix for ' + directory)

    # Save the confusion matrix plot as a PNG file
    output_path = os.path.join("Data", os.path.basename(directory) + "_confusion_matrix.png")
    plt.savefig(output_path)

'''
###############################################################################
Basic main program which calls the function and holds the folder infos
###############################################################################
'''
if __name__ == "__main__":
    # Main function

    # List of folders containing data
    folders = ["Dataset_Lukas_Small_AllReadIn", "Dataset_Noah_Medium_AllReadIn", "Dataset_Benji_AllReadIn"]

    # Path to the trained model
    model_path = 'alphabet_recognition_model.keras'

    # List of class names (labels)
    class_names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
                   'V',
                   'W', 'X', 'Y']

    # Iterate through each folder and create confusion matrix
    for folder in folders:
        folder_path = os.path.join("Data", folder)
        create_confusion_matrix(folder_path, model_path, class_names)
