# initial imports
from flask import Flask
from flask import render_template
from flask import request

# instance and config
app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True


#------------------------------------------------------------------------------


# database connection
# connection = pymysql.connect(host='127.0.0.1', user='root', db='DJPlayList')
# cursor = connection.cursor()


# routes
@app.route("/")
def main():
	return render_template('index.html')


@app.route("/examplePost", methods=['POST'])
def examplePost():
	print(request.values.get("test"))
	return "test"


#------------------------------------------------------------------------------


if __name__ == "__main__":
	app.run()