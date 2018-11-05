import json
import numpy as np

n_vertices = 0
n_edges = 0
feed_cons = {}
edge = {}
pathGroupList = []

def init_network():
    with open("app/static/data.json", "r") as data_file:
        data = json.load(data_file)

    global n_vertices
    n_vertices = data["n_vertices"]
    global n_edges
    n_edges = data["n_edges"] * 2

    global feed_cons
    for fc in data["feed_cons"]:
        if (fc["src"] not in feed_cons):
            feed_cons[fc["src"]] = {}
        feed_cons[fc["src"]][fc["dest"]] = fc

    global edge 
    for e in data["edge"]:
        if (e["src"] not in edge):
            edge[e["src"]] = {}
        edge[e["src"]][e["dest"]] = e

    global pathGroupList
    for pg in data["path_group"]:
        pathGroupList.append(pg)

def eval_network():
    with open("app/static/scenario.json", "r") as data_file:
        data = json.load(data_file)
    v_Feed = []
    v_Consumption = []

    for v in data["vertex"]:
        if (v["consumption_total"] > 0):
            v_Consumption.append(v)
        if (v["feed_total"] > 0):
            v_Feed.append(v)


    while (len(v_Feed) > 0):
        for c in v_Consumption:
            c["leitwert_remaining"] = 0

        for c in v_Consumption:
            for f in v_Feed:
                c["leitwert_remaining"] += 1.0 / feed_cons[f["id"]][f["id"]]["resistance"]

        for c in v_Consumption:
            for f in v_Feed:
                feed_cons[f["id"]][c["id"]]["flow"] = c["consumption_remaining"] * (1.0 / feed_cons[f["id"]][c["id"]]["resistance"]) / c["leitwert_remaining"]                       
        
        v_flow = [0]*n_vertices

        for c in v_Consumption:
            for f in v_Feed:
                v_flow[f["id"]] += feed_cons[f["id"]][c["id"]]["flow"]
        v = 0
        maxOverload = 0.0
        id_maxOverload = 0
        listItem_maxOverload = 9999999
        for f in v_Feed:
            if ((1.0 * v_flow[f["id"]]) / f["feed_total"] > maxOverload):
                if ((1.0 * v_flow[f["id"]]) / f["feed_total"] > 1):
                    id_maxOverload = f["id"]
                    listItem_maxOverload = v
                    maxOverload = (1.0 * v_flow[f["id"]]) / f["feed_total"]
                else:
                    print("Kein Einspeiser überlastet")
            v+=1

        for c in v_Consumption:
            if (len(v_Feed) > 1):
                feed_cons[id_maxOverload][c["id"]]["flow"] = feed_cons[id_maxOverload][c["id"]]["flow"] * 1.0 / (maxOverload) 
            else:
                feed_cons[id_maxOverload][c["id"]]["flow"] = c["consumption_remaining"]
        for c in v_Consumption:
            c["consumption_remaining"] -= feed_cons[id_maxOverload][c["id"]]["flow"]

        if (listItem_maxOverload < n_vertices):
            v_Feed.pop(listItem_maxOverload)

    cons_flow = []
    for i in range(0, n_vertices):
        for j in range(0, n_vertices):
            if feed_cons[i][j]["flow"] != 0:
                tmp = {"src":i, "dest":j, "flow":feed_cons[i][j]["flow"]}
                cons_flow.append(tmp)

    for i in range(0, len(pathGroupList)):
        for s in range(0, n_vertices):
            for d in range(0, n_vertices):
                if (pathGroupList[i]["path_group_src"] == s) and (pathGroupList[i]["path_group_dest"] == d):
                    pathGroupList[i]["flow"] = pathGroupList[i]["flow_share"] * feed_cons[s][d]["flow"]                            

    for pg in pathGroupList:
        for s in range(0, n_vertices):
            for d in range(0, n_vertices):
                if pg["edge_src"] == s and pg["edge_dest"] == d:
                    edge[s][d]["flow"] += pg["flow"]


    for s in range(0, n_vertices):
        for d in range(0, n_vertices):
            if abs(edge[s][d]["flow"]) >= abs(edge[d][s]["flow"]):    
                if edge[s][d]["flow"] > 0:
                    edge[s][d]["flow"] -= edge[d][s]["flow"]
                    edge[d][s]["flow"] = 0
                else:
                    edge[d][s]["flow"] -= edge[s][d]["flow"]
                    edge[s][d]["flow"] = 0
            else:
                if edge[d][s]["flow"] > 0:
                    edge[d][s]["flow"] -= edge[s][d]["flow"]
                    edge[s][d]["flow"] = 0
                else:
                    edge[s][d]["flow"] -= edge[d][s]["flow"]
                    edge[d][s]["flow"] = 0

    edge_flow = []
    for s in range(0, n_vertices):
        for d in range(0, n_vertices):
            if abs(edge[s][d]["flow"]) > 0:
                tmp = edge[s][d]
                edge_flow.append(tmp)

    return json.dumps([cons_flow, edge_flow])

