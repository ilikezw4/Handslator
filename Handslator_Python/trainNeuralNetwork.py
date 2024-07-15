import os
import numpy as np
from keras.layers import Dense, LeakyReLU
from keras import Sequential
from keras.callbacks import EarlyStopping


'''
###############################################################################
Reads the data from a file and put them into an np.array

arg: name of the file
return: an np array filled with the data from the file
###############################################################################
'''
# Function to read data from files
def read_data_from_file(filename):
    with open(filename, "r") as file:
        data = []
        # Read each line from the file and parse as integers
        for line in file.readlines():
            line = line.rstrip('\n')
            data.append([int(x) for x in line.split(',')])
    # Convert the data list to a NumPy array and print it
    print(np.array(data))
    return np.array(data)


'''
###############################################################################
Creates the target array which is filled with one number according to the 
alphabet

arg: length of the needed array
return: index of the array
###############################################################################
'''
# Function to create the target array (0-23) of the same length as data
def create_target_array(data_length, index):
    return np.full(data_length, index, dtype=np.int32)

'''
###############################################################################
Method to fit the neural network with read in data

arg: Training data coordinates from file, Labels from create_target_array and 
        the model to fit
return: returns the trained model
###############################################################################
'''
# Function to train the neural network
def train_neural_network(X_train, y_train, model):
    # Define early stopping to prevent overfitting
    early_stopping = EarlyStopping(monitor='accuracy', mode='max', patience=2, restore_best_weights=True)
    # Train the model with the provided data
    model.fit(X_train, y_train, epochs=10, batch_size=500, validation_split=0.05, callbacks=[early_stopping])
    return model


'''
###############################################################################
Program to train the neural network
###############################################################################
'''

# Directory containing data files
directory = "./Data/merged_dir/"

# Define the neural network model
model = Sequential([
    Dense(192, activation=LeakyReLU(alpha=0.1), input_shape=(63,)),
    Dense(192, activation=LeakyReLU(alpha=0.1)),
    Dense(26, activation='softmax')
])
# Compile the model with optimizer, loss function, and metrics
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Accumulate data and labels
X_train_all = np.array([])
y_train_all = np.array([])

# Iterate through each file in the directory
for idx, fileOrig in enumerate(os.listdir(directory)):
    filename = os.path.join(directory, fileOrig)
    print(f"Processing file: {filename}")

    # Read data from file
    data = read_data_from_file(filename)

    # Create feature (X) and target (y) arrays
    X_train = data
    y_train = create_target_array(len(data), idx)

    # Accumulate data and labels
    if X_train_all.size == 0:
        X_train_all = X_train
        y_train_all = y_train
    else:
        X_train_all = np.concatenate((X_train_all, X_train))
        y_train_all = np.concatenate((y_train_all, y_train))

# Shuffle the data and labels
perm_indices = np.random.permutation(len(X_train_all))
shuffled_X_train = X_train_all[perm_indices]
shuffled_y_train = y_train_all[perm_indices]

# Train the neural network with accumulated and shuffled data
model = train_neural_network(shuffled_X_train, shuffled_y_train, model)

# Save the trained model in Keras format
model.save("alphabet_recognition_model.keras")
