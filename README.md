# spotifyAPI
NO USER INTERFACE. Uses the Spotify API and a custom algorithm to find the most similar songs in a playlist. Threw this together in a few hours as a proof-of-concept / to play around with the API.

## Try it yourself:
1. '$ cd' to the root directory of this project after cloning and run with 'python3 app.py'. 
2. Visit https://accounts.spotify.com/en/authorize?client_id=&redirect_uri=http:%2F%2Flocalhost:5000&response_type=token and sign in to your Spotify Account.
3. Copy the token from the URL of the redirect and paste it after 'Bearer ' in password: "Bearer {token}".
4. Open a new browser tab and visit http://localhost:5000/?current_song=4c7mwtU8HGuLUVqRX5HU7F with the developer console open.
