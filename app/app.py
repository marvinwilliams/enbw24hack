from flask import Flask, jsonify, render_template, Response, stream_with_context, json, url_for, send_file
import psycopg2
import psycopg2.extras
import algo

app = Flask(__name__)
app.config.from_pyfile('config.cfg')

webhost = app.config['HOST']
webport = app.config['PORT']


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/points_of_interest')
def points_of_interest():
    print("called");
    return send_file('static/test.geojson');

@app.route('/eval_network')
def call_eval_network():
    return algo.eval_network()

def get_cursor():
    return conn.cursor(cursor_factory=psycopg2.extras.DictCursor)


if __name__ == '__main__':
    algo.init_network()
    app.debug = True
    app.run(host=webhost, port=webport)
