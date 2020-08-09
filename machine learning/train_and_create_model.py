import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, matthews_corrcoef, f1_score
import pickle

def train_and_create_model(filename, label_name):
	X = pd.read_csv(filename, sep = ";")
	y = X.pop(label_name)

	X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.3)

	clf = DecisionTreeClassifier()
	clf.fit(X_train, y_train)

	# Can't use numpy substract method on booleans ...
	y_pred = clf.predict(X_test).astype("float")

	print(f"Accuracy: {accuracy_score(y_test, y_pred):.3f}")
	print(f"MCC: {matthews_corrcoef(y_test, y_pred):.3f}")
	print(f"F1 score: {f1_score(y_test, y_pred):.3f}")

	with open('model.pkl', 'wb') as model_file:
		pickle.dump(clf, model_file, protocol = 2) # backward compatibility

if __name__ == "__main__":
	train_and_create_model('dataset.csv', 'broken')