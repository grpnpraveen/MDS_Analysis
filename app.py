import numpy as np
import pandas as pd
from sklearn.manifold import MDS
from sklearn import preprocessing
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
from flask import Flask, render_template,jsonify
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)

np.random.seed(40)
# Data Loading
data = pd.read_csv('static/data/data.csv')
data_with_category_features = pd.DataFrame(data)
# Features || columns
features = ["temperature_celsius","wind_kph","pressure_in","humidity","feels_like_celsius","visibility_km","uv_index","gust_kph","air_quality_Carbon_Monoxide","air_quality_Ozone","air_quality_Nitrogen_dioxide","air_quality_Sulphur_dioxide"]
data = pd.DataFrame(data, columns=features)
data = data.dropna() # drop NA's 

features.append("condition_text")
features.append("wind_direction")
features.append("moon_phase")

scaled_data = StandardScaler().fit(data).transform(data)

euc_mds = MDS(dissimilarity='euclidean', random_state=None)
euc_mds.fit(scaled_data)
euc_mds_points = np.array(euc_mds.embedding_ * 10, dtype=int)
euc_mds_list = euc_mds_points.tolist()

scaled_data = pd.DataFrame(scaled_data)
corr_matrix = scaled_data.corr().abs()
corr_dist_matrix = 1 - corr_matrix
model = MDS(n_components=2, dissimilarity='precomputed', random_state=6)
mds_correlation_list = model.fit_transform(corr_dist_matrix).tolist()

# class without category
k = KMeans(n_clusters=6, random_state=None).fit(euc_mds_points)
mds_cluster = k.labels_.tolist()
# class with category
data_with_category_features['condition_text'] = preprocessing.LabelEncoder().fit_transform(data_with_category_features['condition_text'])
data_with_category_features['wind_direction'] = preprocessing.LabelEncoder().fit_transform(data_with_category_features['wind_direction'])
data_with_category_features['moon_phase'] = preprocessing.LabelEncoder().fit_transform(data_with_category_features['moon_phase'])

k = KMeans(n_clusters=6, random_state=None).fit(data_with_category_features)
pcp_cluster = k.labels_.tolist()


datafile = 'static/data/data.csv'
df = pd.read_csv(datafile)
# Remove Categorical
df = df.drop('condition_text', axis=1)
df = df.drop('wind_direction', axis=1)
df = df.drop('moon_phase', axis=1)
cluster_size = 11
# Eigen Vectors
scaled_data = StandardScaler().fit(df).transform(df)
# K means 
k = range(1, cluster_size)
clusters_list = []
for c in k:
    clusters_list.append(KMeans(n_clusters=c, init='k-means++').fit(scaled_data))
centers_list = []
for cluster_c in clusters_list:
    centers_list.append(cluster_c.cluster_centers_)
kdistance_list = []
for cent in centers_list:
    kdistance_list.append(cdist(scaled_data, cent, 'euclidean'))
distances_list = []
for K_d in kdistance_list:
    distances_list.append(np.min(K_d, axis=1))
average_dist_list = []
for dist in distances_list:
    average_dist_list.append(round(np.sum(dist) / scaled_data.shape[0],2))


@app.route('/')
def home():
    return render_template('index.html', euc_mds_list=euc_mds_list, mds_cluster=mds_cluster, features=features,mds_correlation_list=mds_correlation_list,pcp_cluster= pcp_cluster,elbowXvalues=list(range(1,cluster_size)),elbowYvalues=average_dist_list)



@app.route('/k/<int:new_k>')
def home2(new_k):

    k = KMeans(n_clusters=new_k, random_state=None).fit(data_with_category_features)
    pcp_cluster = k.labels_.tolist()
    data2={}
    data2["pcp_cluster"] = pcp_cluster
    k = KMeans(n_clusters=new_k, random_state=None).fit(euc_mds_points)
    mds_cluster = k.labels_.tolist()
    data2["mds_cluster"] = mds_cluster

    return jsonify(data2)


if __name__ == "__main__":
    app.run(debug=True)


