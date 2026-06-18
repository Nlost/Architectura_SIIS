### import biblioteci
### tensorflow este o biblioteca cu care se pot efectua operatii matematice complexe si de asemenea este folosita pentru invatarea automata
import os
import tensorflow as tf

# TensorFlow 2.x ruleaza implicit in mod eager; tutorialul foloseste API TF 1.x
tf.compat.v1.disable_eager_execution()

### numpy are suport pentru operatii complexe cu tablouri de dimensiuni mari
import numpy as np### este o biblioteca software pentru manipularea și analiza datelor
import pandas as pd

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(SCRIPT_DIR, "Pacienti.csv")

FEATURE_COLUMNS = ["Puls", "SpO2", "Temperatura", "Umiditate"]
CLASS_LABELS = ["Stare-stabil", "Stare-observatie", "Stare-alerta"]

### citim datele exportate din Admin -> Export CSV (Pacienti.csv)
data = pd.read_csv(CSV_PATH, index_col=0)
print(data.head())
print(data.shape)

if len(data) < 3:
    raise SystemExit("Fișierul Pacienti.csv trebuie să conțină cel puțin 3 pacienți cu măsurători complete.")

# maparea datelor in vectori (3 clase de stare de sanatate)
stabil = np.asarray([1, 0, 0])
observatie = np.asarray([0, 1, 0])
alerta = np.asarray([0, 0, 1])
data["StareSanatate"] = data["StareSanatate"].map(
    {
        "Stare-stabil": stabil,
        "Stare-observatie": observatie,
        "Stare-alerta": alerta,
    }
)
print(data)

# amestecarea datelor
data = data.iloc[np.random.permutation(len(data))]
print(data)

data = data.reset_index(drop=True)
print(data)

train_end = max(1, int(len(data) * 0.7) - 1)
test_start = train_end + 1

# datele pentru invatare
x_input = data.loc[0:train_end, FEATURE_COLUMNS]
temp = data["StareSanatate"]
y_input = temp[0 : train_end + 1]

# datele pentru test
x_test = data.loc[test_start:, FEATURE_COLUMNS]
y_test = temp[test_start:]

# substituienti (placeholders) si variabile.
# sunt 4 intrari si 3 clase de iesiri
x = tf.compat.v1.placeholder(tf.float32, shape=[None, 4])
y_ = tf.compat.v1.placeholder(tf.float32, shape=[None, 3])

# weight and bias
W = tf.compat.v1.Variable(tf.zeros([4, 3]))
b = tf.compat.v1.Variable(tf.zeros([3]))
# modelul
# functia softmax pentru clasificare a multiclaselor
y = tf.nn.softmax(tf.matmul(x, W) + b)

# loss function
cross_entropy = tf.reduce_mean(-tf.reduce_sum(y_ * tf.math.log(y), axis=1))
# optimizator
train_step = tf.compat.v1.train.AdamOptimizer(0.01).minimize(cross_entropy)

# calcularea acuratetei modelului nostru
correct_prediction = tf.equal(tf.argmax(y, 1), tf.argmax(y_, 1))
accuracy = tf.reduce_mean(tf.cast(correct_prediction, tf.float32))

# parametrii sesiunii
sess = tf.compat.v1.InteractiveSession()

# initializarea variabilelor
init = tf.compat.v1.global_variables_initializer()
sess.run(init)

# numarul de iteratii
epoch = 2000

for step in range(epoch):
    _, c = sess.run(
        [train_step, cross_entropy],
        feed_dict={
            x: x_input.to_numpy(dtype=np.float32),
            y_: np.array([t for t in y_input.to_numpy()], dtype=np.float32),
        },
    )
    if step % 500 == 0:
        print(c)

# predictia pentru datele de test si acuratetea
for i in range(test_start, len(data)):
    a = data.loc[i, FEATURE_COLUMNS]
    b_values = a.values.reshape(1, 4)

    print("Pentru valorile: ")
    print(b_values)

    largest = sess.run(tf.math.argmax(y, 1), feed_dict={x: b_values})[0]
    print(f"Starea prezisa este: {CLASS_LABELS[largest]}\n")

if len(x_test) > 0:
    print("Acuratetea generala este: ")
    print(
        sess.run(
            accuracy,
            feed_dict={
                x: x_test.to_numpy(dtype=np.float32),
                y_: np.array([t for t in y_test.to_numpy()], dtype=np.float32),
            },
        )
    )
else:
    print("Nu exista suficiente date de test pentru calculul acuratetii.")
