from sys import argv as args
from pandas import read_json
from joblib import load
import json
from os import getcwd, chdir, path

def pred(data):
	clfr = load(f'{getcwd()}/model.pkl')
	output = { "pred": clfr.predict(read_json(data)).astype(float).tolist() }
	return json.dumps(output)

if __name__ == "__main__":
	if len(__file__) > 7:
		chdir(path.dirname(__file__))
	print("No data specified !" if len(args) == 1 else pred(args[1]))
