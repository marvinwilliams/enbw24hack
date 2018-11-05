import json
import numpy as np

with open("data.json", "r") as data_file:
    data = json.load(data_file)

n_vertices = data["n_vertices"]
n_edges = data["n_edges"]

feed_cons = {}
for (fc in data["feed_cons"]):
    if (fc["src"] not in feed_cons):
        feed_cons[fc["src"]] = {}
    feed_cons[fc["src"]][fc["dest"]] = fc


v_Feed = []
v_Consumption = []

for (v in data["vertex"]):
    if (v["consumptionTotal"] > 0):
        v_Consumption.append(v)
    if (v["feedTotal"] > 0):
        v_Feed.append(v)

while (v_Feed.Count > 0):
    for (c in v_Consumption):
        c["leitwertRemaining"] = 0

    for (c in v_Consumption):
        for (f in v_Feed):
            c["leitwertRemaining"] += 1 / feed_cons[f["ID"]][f["ID"]]["resistance"]

    for (c in v_Consumption):
        for (f in v_Feed):
            feed_cons[f["ID"]][f["ID"]]["flow"] = c["consumptionRemaining"] * (1 / feed_cons[f["ID"]][f["ID"]]["resistance"]) / c["leitwertRemaining"]                       

    v_flow = [0]*n_vertices

    for (Vertex v_ConsumptionElement in v_Consumption)
    {
            foreach (Vertex v_FeedElement in v_Feed)
            {
                if (Double.IsNaN(feed_cons[v_FeedElement.ID, v_ConsumptionElement.ID].flow))
                {
                    Console.WriteLine("feed_cons[v_FeedElement.ID, v_ConsumptionElement.ID].flow weist ungültigen Wert auf");
                    Console.ReadKey();
                    }
                else { 
                    v_flow[v_FeedElement.ID] += feed_cons[v_FeedElement.ID, v_ConsumptionElement.ID].flow;
                    }

                }
            }

    int v = 0;
            double maxOverload = 0;
            int ID_maxOverload = 0;
            int listItem_maxOverload = 9999999;

            foreach (Vertex vertexElement in v_Feed)
            {
                    if (v_flow[vertexElement.ID] / vertexElement.feedTotal > maxOverload)
                    {
                        if (v_flow[vertexElement.ID] / vertexElement.feedTotal > 1) { 

                            ID_maxOverload = vertexElement.ID;
                            listItem_maxOverload = v;
                            maxOverload = v_flow[vertexElement.ID] / vertexElement.feedTotal;
                            }else
                        {
                            Console.WriteLine("Kein Einspeiser überlastet");
                            }
                        }
                    v++;
                    }



            // Die Flüsse vom max. überlasteten Einspeiser werden prozentual auf die verfügbare Einspeisemenge reduziert;
            foreach (Vertex vertexElement in v_Consumption)
            {
                    if (v_Feed.Count > 1) {
                        feed_cons[ID_maxOverload, vertexElement.ID].flow = feed_cons[ID_maxOverload, vertexElement.ID].flow * 1 / (maxOverload);                        
                        }
                    else
                    {
                        feed_cons[ID_maxOverload, vertexElement.ID].flow = vertexElement.consumptionRemaining;
                        }
                    }

            c = 0;
            foreach (Vertex vertexElement in v_Consumption)
            {
                    v_Consumption[c].consumptionRemaining -= feed_cons[ID_maxOverload, vertexElement.ID].flow;

                    c++;
                    }

            // Der Einspeiser wird aus der weiteren Berechnung herausgenommen.

            if (listItem_maxOverload < v_total)
            {
                    v_Feed.RemoveAt(listItem_maxOverload); // delete v_feed[ID_maxOverload]
                    }
            } // end while, solange noch Feeds in v_feed-Liste sind
