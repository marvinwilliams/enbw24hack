from flask import Flask, jsonify, render_template, Response, stream_with_context, json, url_for, send_file, request
import psycopg2
import psycopg2.extras
import algo

app = Flask(__name__)
app.config.from_pyfile('config.cfg')

webhost = app.config['HOST']
webport = app.config['PORT']


with open("static/scenario.json", "r") as scenario_file:
    scenario = json.load(scenario_file)

def set_consumption(id, time):
    for v in scenario["vertex"]:
        if v["id"] == id:
            v["consumption_total"] = max(min(v["consumption_total"] + time * 1000, 70000), 0)
            v["consumption_remaining"] = v["consumption_total"]

def set_feed(id, time):
    for v in scenario["vertex"]:
        if v["id"] == id:
            v["feed_total"] = max(min(v["feed_total"] + time * 1000, 70000), 0)
            v["feed_remaining"] = v["feed_total"]

@app.route('/')
def index():
    return render_template("index.html")


@app.route('/points_of_interest')
def points_of_interest():
    print("called");
    return send_file('static/test.geojson');

@app.route('/eval_network')
def call_eval_network():
    return algo.eval_network(scenario)

@app.route('/ticktock', methods = ['POST'])
def get_post_javascript_data():
    jsdata = int(request.form['javascript_data'])
    set_consumption(0, -1 * jsdata)
    set_consumption(8, 3 * jsdata)
    set_consumption(10, 1 * jsdata)
    set_consumption(7, -2 * jsdata)
    set_feed(1, 2 * jsdata)
    set_feed(4, -2 * jsdata)
    return "success"


def get_cursor():
    return conn.cursor(cursor_factory=psycopg2.extras.DictCursor)


if __name__ == '__main__':
    algo.init_network()
    app.debug = True
    app.run(host=webhost, port=webport)
