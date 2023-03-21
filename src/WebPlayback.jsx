import React, { useState, useEffect } from 'react';
import axios from 'axios';
const PODCASTS_ENDPOINT = "https://api.spotify.com/v1/me/episodes";
const PLAYLISTS_ENDPOINT = "https://api.spotify.com/v1/me/playlists";
const PLAY_ENDPOINT = "https://api.spotify.com/v1/me/player/play"
const CURRENT_PLAYBACK = "https://api.spotify.com/v1/me/player"



const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

function WebPlayback(props) {

    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);

    const [podcasts, setPodcasts] = useState([]);
    const [selectedPodcast, setSelectedPodcast] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);

    //functions to get podcasts and playlists
    const getPodcasts = () => {
        axios.get(PODCASTS_ENDPOINT, {
            headers: {
                Authorization: "Bearer " + props.token,
            }
        }).then(response => {
            setPodcasts(response.data.items); 
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const getPlaylists = () => {
                axios.get(PLAYLISTS_ENDPOINT, {
                    headers: {
                        Authorization: "Bearer " + props.token,
                    }
                }).then(response => {
                    setPlaylists(response.data.items);
                })
                .catch((error) => {
                    console.log(error);
                });
            }

    //functions to play the sdk connect with a specific uri
    // const handlePlaylistClick = (id) => {
    //     axios.put(PLAY_ENDPOINT, {
    //       context_uri: `spotify:playlist:${id}`
    //     }, {
    //       headers: {
    //         Authorization: "Bearer " + props.token,
    //         "Content-Type": "application/json"
    //       }
    //     }).then(response => {   
    //       console.log("started playing")
    //       setSelectedPlaylist(id)
    //     })
    //     .catch((error) => {
    //       console.log(error);
    //     });
    //   }

      //version two of handle playlists
      const handlePlaylistClick = (id) => {
        //get all the tracks in the selected playlist
        axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
          headers: {
            Authorization: "Bearer " + props.token
          }
        }).then(response => {
         //choose a track at random
          const tracks = response.data.items;  
          const randomTrackIndex = Math.floor(Math.random() * tracks.length);
          const randomTrackUri = tracks[randomTrackIndex].track.uri;
          //play that track via put call to me/player/play
          axios.put(PLAY_ENDPOINT, {
            uris: [randomTrackUri]
          }, {
            headers: {
              Authorization: "Bearer " + props.token,
              "Content-Type": "application/json"
            }
          }).then(response => {   
            console.log("started playing")
            setSelectedPlaylist(id)
          })
          .catch((error) => {
            console.log(error);
          });
        })
        .catch((error) => {
          console.log(error);
        });
      }
      

      const handlePodcastClick = (id) => {
        axios.put(PLAY_ENDPOINT, {
          uris: [`spotify:episode:${id}`]
        }, {
          headers: {
            Authorization: "Bearer " + props.token,
            "Content-Type": "application/json"
          }
        }).then(response => {   
          console.log("started playing")
          setSelectedPodcast(id)
        })
        .catch((error) => {
          console.log(error);
        });
      }

      const togglePlayback = () => {
        axios.get(CURRENT_PLAYBACK, {
          headers: {
            Authorization: "Bearer " + props.token,
          },
        })
        .then(response => {
            if(response.data.currently_playing_type === "track"){
                handlePodcastClick(selectedPodcast)
            }
            if(response.data.currently_playing_type === "episode"){
                handlePlaylistClick(selectedPlaylist)
            }
        })
        .catch(error => {
          console.log(error);
        });
      }

      const transferPlayback = (id) => {
        axios.put(CURRENT_PLAYBACK, {
            device_ids: [id]
          }, {
            headers: {
              Authorization: "Bearer " + props.token,
              "Content-Type": "application/json"
            }
          }).then(response => {   
            console.log("transferred playback to active SDK")
          })
          .catch((error) => {
            console.log(error);
          });
      }

    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Podcast-Switcher-V3',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });

            
            setPlayer(player);
            
            

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                transferPlayback(device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', ( state => {
                if (!state) {
                    return;
                }
                setTrack(state.track_window.current_track);
                setPaused(state.paused);

                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });

            }));

            player.connect();
            
           
        };
            
            getPodcasts()
            getPlaylists()

    }, []);

    if (!is_active) { 
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Instance not active. Transfer your playback using your Spotify app </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">

                        <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>

                            <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                                &lt;&lt;
                            </button>

                            <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                                { is_paused ? "PLAY" : "PAUSE" }
                            </button>

                            <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                                &gt;&gt;
                            </button>
                            <button className="btn-spotify" onClick={() => {togglePlayback()}}>
                                Toggle Playback
                            </button>

                        </div>
                        <div className="podcasts">
                        {podcasts.map((podcast) => <button className="btn-spotify" title={podcast.epsiode} key={podcast.episode.id}
                            onClick={() => handlePodcastClick(podcast.episode.id)}
                            // onClick={() => {
                            //     player.pause();
                            //     player
                            //     .setVolume(0.5)
                            //     .then(() => {
                            //         return player.play({
                            //         spotify_uri: playlist.uri,
                            //         offset: { position: 0 },
                            //         });
                            //     })
                            //     .then(() => {
                            //         setSelectedPlaylist(playlist.id);
                            //     });
                            // }}
                            style={{ fontWeight: selectedPodcast === podcast.episode.id ? "bold" : "normal" }}
                            >
                            
                            {podcast.episode.name}</button>) }

                        </div>
                        <div className="playlists">
                               {playlists.map((playlist) => 
                               
                               //<button className="btn-spotify" title={playlist.name} key={playlist.id}>{playlist.name}</button>
                               <button
                                    className="btn-spotify"
                                    title={playlist.name}
                                    key={playlist.id}
                                    onClick={() => handlePlaylistClick(playlist.id)}
                                    // onClick={() => {
                                    //     player.pause();
                                    //     player
                                    //     .setVolume(0.5)
                                    //     .then(() => {
                                    //         return player.play({
                                    //         spotify_uri: playlist.uri,
                                    //         offset: { position: 0 },
                                    //         });
                                    //     })
                                    //     .then(() => {
                                    //         setSelectedPlaylist(playlist.id);
                                    //     });
                                    // }}
                                    style={{ fontWeight: selectedPlaylist === playlist.id ? "bold" : "normal" }}
                                    >
                                    {playlist.name}
                                    </button>
                               )}
                        </div>

                    </div>
                </div>
            </>
        );
    }
}

export default WebPlayback
