import math
import mediapipe as mp
import cv2
import numpy as np
from collections import deque
import re

# Constants for detection precision
MOVEMENT_THRESHOLD = 0.03
MAX_POSITIONS = 5
letter = "J"
# saving yes/no
doWrite = True

'''
###############################################################################
Function for normalizing coordinates when your hand gets away fom the camera
All Coordinates are no relative to the distance between the bottom of the Palm 
and below the Pointer Finger

arg: list of 21 coordinates
return: string of normalized
###############################################################################
'''


def normalize(normarr):
    # Norm Factor calculated with one of the Palm coordinates via Pythagoean Theorem
    normNumber = 200 / (math.sqrt(math.pow(int(normarr[12]), 2) + math.pow(int(normarr[13]), 2)))
    # Multiply Every Coordinate with the Normalize Factor exclude every third coordinate since its already Normalized
    for i in range(3, len(normarr), 3):
        normarr[i] = str(math.floor(int(normarr[i]) * normNumber))
        normarr[i + 1] = str(math.floor(int(normarr[i + 1]) * normNumber))
    return normarr


'''
###############################################################################
Function for filtering coordinates removes the additional explanatory Data 
coming from the Mediapipe with a regex Multiplies all coordinates with 1000 to 
change the scope from 0-1 to 0-1000 Normalizes every coordinate relative to the
 base of the palm

arg: list of 21 coordinates 
return: string of filtered coordinates 
###############################################################################
'''


def filterNumbers(toFilterObject):
    # regex filter
    # list comprehension + removing coma
    print(toFilterObject)
    filteredList = re.findall(r'[-+]?(?:\.\d+|\d+(?:\.\d*)?)(?:[Ee][-+]?\d+)?', str(toFilterObject))
    print(filteredList)
    # multiply every coordinate by 1000, if coordinate has a very low 10^- multiplier then set it to 0
    filteredList = [str(round(float(num) * 1000)) if 'e' not in num.lower() else '0' for num in filteredList]
    basecoordx = filteredList[0]
    basecoordy = filteredList[1]

    # i for x-coordinate  /  i+1 for y-coordinate
    for i in range(3, len(filteredList), 3):
        filteredList[i] = str(int(filteredList[i]) - int(basecoordx))
        filteredList[i + 1] = str(int(filteredList[i + 1]) - int(basecoordy))
    # Normalize Method
    normalizedList = normalize(filteredList)
    # Create string from List
    filteredString = ",".join(normalizedList)

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
    # set up mediapipe
    mp_drawing = mp.solutions.drawing_utils
    mp_hands = mp.solutions.hands

    # setup hand detection set maximum for hands to 1
    with mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5, max_num_hands=1) as hands:
        cap = cv2.VideoCapture(0)
        file = open(f'Data/TMP/{letter}', 'w')
        # changes directory for saving pictures
        #os.chdir(f"./Data/Pictures/{letter}")

        # setup dequeue
        previous_hand_positions = deque(maxlen=MAX_POSITIONS)
        while cap.isOpened():
            if not cap:
                break

            ret, frame = cap.read()
            # resize window
            # resizedFrame = cv2.resize(frame, (720, 720), interpolation=cv2.INTER_CUBIC)
            resizedFrame = frame

            # grey scale
            image = cv2.cvtColor(resizedFrame, cv2.COLOR_BGR2RGB)
            # calc hand landmarks
            results = hands.process(image)

            if results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0].landmark
                # add hand landmarks to np array
                hand_positions = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks])
                previous_hand_positions.append(hand_positions)

                if len(previous_hand_positions) == MAX_POSITIONS:
                    # calc average if all dequeue positions are filled
                    average_hand_position = calculateAverage(previous_hand_positions)
                    # calc difference between average and current coords
                    difference = np.linalg.norm(hand_positions - average_hand_position)
                    if difference < MOVEMENT_THRESHOLD and doWrite:
                        # print("capture")
                        data = filterNumbers(results.multi_hand_landmarks)
                        file.write(str(data))
                        file.write('\n')
                        # saves current frame to corresponding folder
                        #cv2.imwrite(f"{letter}_{datetime.date.today()}_{time.time()}.png", frame)
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
            cv2.imshow('pretty cool dude ----v', flippedImage)
            # Check if Q is pressed
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

    cv2.destroyAllWindows()


HandDetectionMP()
