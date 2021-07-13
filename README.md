# Playlist Wizard

##### Organize, view and create Spotify playlists easily! Playlist wizard allows you to create new playlists effortlessly by searching Spotify and picking songs from your own playlists. You can also sort the playlists by song name, album, and date added. The playlist on shuffle with no repeating songs.


## Run the application in development

In one console run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

#### and

in another console go to the backend folder and run

### `nodemon server`

Runs a express server using MongoDB as the database.

#### However

In order for the backend to work you need to add MongoDB and Spotify. First
create a copy of the file **.env.sample** and name it **.env** and save it in the same folder.

#####  MongoDB

1. The first step is to make an account at the [MongoDB Atlas website](https://www.mongodb.com/cloud/atlas?utm_campaign=atlas_bc_mern&utm_source=medium&utm_medium=inf&utm_term=campaign_term&utm_content=campaign_content)
2. Go through the steps of creating a cluster. There are free and paid options for hosting the database.
3. After the cluster is created, click the connect button to connect to the cluster. For the IP address just use your current IP address and create a database user.
4. For the connection method, click on the second option **Connect Your Application**.
5. Replace **[MongoDB Atlas URI]** in the **.env** file you created earlier with the connection string. Remember to change **&lt;password&gt;** in the connection string with the password of the user you made earlier.

#####  Spotify

1. Login/Sign up to [Spotify's developer dashboard](https://developer.spotify.com/dashboard/).
2. Click on Create an app and go through the process of creating an app.
3. Replace **[Spotify Client ID]** and **[Spotify Client Secret]** in the **.env** file with the client id and secret that can be found on the newly created app.
4. Click on **Edit Settings** and add **http://localhost:3000/loading** to **Redirect URIs**.

If there are any errors please feel free to submit a issue and if you would like to add to this project you can submit a pull request with the changes.
