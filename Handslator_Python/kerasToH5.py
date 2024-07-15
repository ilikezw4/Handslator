from tensorflow.python.keras.models import load_model
'''
###############################################################################
Function which just plainly loads the .keras and saves it as an H5

arg: keras model path, and save path for H5
return: No real return saves file
###############################################################################
'''
def convert_keras_to_h5(keras_model_path, h5_model_path):
    # Load the Keras model
    keras_model = load_model(keras_model_path, compile=False)

    # Save the model in HDF5 format
    keras_model.save(h5_model_path)

    print(f"Model successfully converted from {keras_model_path} to {h5_model_path}")

# Replace 'your_model.keras' with the actual path to your Keras model file
keras_model_path = 'alphabet_recognition_model.keras'

# Replace 'converted_model.h5' with the desired name for the converted HDF5 model file
h5_model_path = 'alphabet_recognition_model.h5'

# Call the conversion function
convert_keras_to_h5(keras_model_path, h5_model_path)
