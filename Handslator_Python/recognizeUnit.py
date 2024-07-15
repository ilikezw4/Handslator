import math
import mediapipe as mp
import cv2
import numpy as np
from collections import deque
import re
import tensorflow as tf
from keras.layers import BatchNormalization, LeakyReLU
from tensorflow.python.keras.models import load_model
from tensorflow.python.keras.layers import LeakyReLU

# Constants for detection precision
MOVEMENT_THRESHOLD = 0.05
MAX_POSITIONS = 20
prev_coordinates = None

'''
###############################################################################
Load a Custom model if needed

arg: Path to the model
return: A neural network model
###############################################################################
'''
def load_custom_model(model_path):
    custom_objects = {'LeakyReLU': LeakyReLU(), 'BatchNormalization': BatchNormalization()}
    return load_model(model_path, custom_objects=custom_objects, compile=False)

'''
###############################################################################
Function which loads the pre trained neural network and predicts the given 
coordinates

arg: list of 21 coordinates
return: Single Character
###############################################################################
'''

def predictNeuralNetwork(x):
    # model = load_custom_model('OptimizedModel.keras')
    model = load_model('training_1/alphabet_recognition_model.keras', compile=False)
    test_x = tf.expand_dims(x, axis=0)
    prediction = model.predict(test_x)

    # print(str(x) + ", " + str(np.argmax(prediction)))
    print("Prediction des Neuronalen Netzes: ", prediction)
    num = np.argmax(prediction)
    print("Ergebnis der Argmax Funktion: ", num)
    return chr(65 + num)


'''
##############################################################################
Function for normalizing coordinates when your hand gets away fom the camera

arg: list of 21 coordinates
return: string of normalized
##############################################################################
'''


def normalize(normarr):
    normNumber = (200 / (math.sqrt(math.pow(int(normarr[12]), 2) + math.pow(int(normarr[13]), 2))))
    # print(str(normNumber) + '\n')

    for i in range(3, len(normarr), 3):
        normarr[i] = str(math.floor(int(normarr[i]) * normNumber))
        normarr[i + 1] = str(math.floor(int(normarr[i + 1]) * normNumber))

    return normarr


'''
###############################################################################
Function for filtering coordinates

arg: list of 21 coordinates 
return: string of filtered coordinates 
###############################################################################
'''


def filterNumbers(toFilterObject):
    # regex filter
    filteredList = re.findall(r'[-+]?(?:\.\d+|\d+(?:\.\d*)?)(?:[Ee][-+]?\d+)?', str(toFilterObject))
    # list comprehension + removing coma
    filteredList = [str(round(float(num) * 1000)) if 'e' not in num.lower() else '0' for num in filteredList]
    basecoordx = filteredList[0]
    basecoordy = filteredList[1]

    for i in range(3, len(filteredList), 3):
        filteredList[i] = str(int(filteredList[i]) - int(basecoordx))
        filteredList[i + 1] = str(int(filteredList[i + 1]) - int(basecoordy))

    filteredString = ",".join(normalize(filteredList))

    return filteredString


'''
###############################################################################
Function for calculating the average of coordinates within a dequeue

arg: dequeue of coordinates
return: average of coordinates 
###############################################################################
'''


def calculateAverage(points):
    # calculates average
    return np.mean(points, axis=0)


'''
###############################################################################
Main Function 
###############################################################################
'''


def HandDetectionMP():
    capHandFrames = 0
    stop_moment = False
    text = "Eingabe:"
    font = cv2.FONT_HERSHEY_SIMPLEX

    # set up mediapipe
    mp_drawing = mp.solutions.drawing_utils
    mp_hands = mp.solutions.hands

    # saving yes/no
    # setup hand detection
    with mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5, max_num_hands=1) as hands:
        cap = cv2.VideoCapture(0)
        file = open('Data/data', 'w')
        # setup dequeue
        previous_hand_positions = deque(maxlen=MAX_POSITIONS)
        while cap.isOpened():
            ret, frame = cap.read()
            # resize window
            resizedFrame = cv2.resize(frame, (720, 720), interpolation=cv2.INTER_CUBIC)
            if not ret:
                break

            # grey scale
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            # calc hand landmarks
            results = hands.process(image)

            if results.multi_hand_landmarks:
                capHandFrames += 1
                hand_landmarks = results.multi_hand_landmarks[0].landmark

                # add hand landmarks to np array
                hand_positions = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks])

                previous_hand_positions.append(hand_positions)

                if len(previous_hand_positions) == MAX_POSITIONS:
                    # calc average if all dequeue positions are filled
                    average_hand_position = calculateAverage(previous_hand_positions)
                    # calc difference between average and current coords
                    difference = np.linalg.norm(hand_positions - average_hand_position)
                    if difference < MOVEMENT_THRESHOLD and stop_moment == False:
                        stop_moment = True
                        previous_hand_positions.clear()
                        data = filterNumbers(results.multi_hand_landmarks)
                        x = data.split(',')
                        for i in range(0, len(x)):
                            x[i] = int(x[i])

                        npx = np.array(x)
                        result = predictNeuralNetwork(npx)

                        text += result

                    elif difference > MOVEMENT_THRESHOLD:
                        stop_moment = False

            # revert to colored image
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            # draws landmarks
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(
                        image,
                        hand_landmarks,
                        mp_hands.HAND_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                        mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2),
                    )
            # flips image
            flippedImage = cv2.flip(image, 1)
            # shows live feed

            text_rn = (text[(len(text) - 8):(len(text) - 0)])

            # get boundary of this text
            textsize = cv2.getTextSize(text_rn, font, 1, 2)[0]

            # get coords based on boundary
            textX = int((frame.shape[1] - textsize[0]) / 2)
            textY = int((frame.shape[0] + textsize[1]) * 5 / 6)
            # Fenstergröße: 640x480
            cv2.rectangle(flippedImage, (int(textX - (textsize[0] / 2)), int(textY - (textsize[1] * 1.5))),
                          (int(textX + (textsize[0] * 1.5)), int(textY + (textsize[1] * 0.9))), (0, 0, 0), -1)
            cv2.putText(flippedImage, text_rn, (int(textX), int(textY)), font, 1, (255, 255, 255), 2)

            cv2.imshow('Handslator-Gebaerdensprache-202324', flippedImage)

            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

    cv2.destroyAllWindows()


HandDetectionMP()
