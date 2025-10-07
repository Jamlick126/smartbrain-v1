import React, { Component } from 'react';
import ParticlesBg from 'particles-bg';
import Navigation from './Components/Navigation/Navigation';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from "./Components/ImageLinkForm/ImageLinkForm";
import Rank from "./Components/Rank/Rank";
import FaceRecognition from "./Components/FaceRecognition/FaceRecognition";

import './App.css';

const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';

const returnClarifaiRequestOptions = (imageUrl) => {

     // Your PAT (Personal Access Token) can be found in the Account's Security section
    const PAT = 'fcd321cdd69c413d82a77572cb26beaf';
    // Specify the correct user_id/app_id pairings
    const USER_ID = 'eagle-eye247';       
    const APP_ID = 'smart-brain';
    // Change these to whatever model and image URL you want to use
       
    const IMAGE_URL = imageUrl;

    ///////////////////////////////////////////////////////////////////////////////////
    // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
    ///////////////////////////////////////////////////////////////////////////////////

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                    }
                }
            }
        ]
    });

    return {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box:{},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0
      }
    }
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch("https://api.clarifai.com/v2/models/" + 
      MODEL_ID + "/versions/" + MODEL_VERSION_ID +
      "/outputs", returnClarifaiRequestOptions(this.state.input))
        .then(response => response.json()) // Change to response.json() to parse JSON
        .then(response => {
          console.log('Hi', response)
          if (response && response.outputs && response.outputs[0].data.regions) {
            fetch('http://localhost:3000/image', {
              method: 'put',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify({
                id: this.state.user.id
              })
            })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user,
                 {entries: count} ))
            })
            //.catch(console.log);
           .catch(err => console.log('Error updating entries:', err));
           this.displayFaceBox(this.calculateFaceLocation(response));
          } 
        })//.catch(error => console.log('No faces detected or unexpected API response', error));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }


  render() {
    const { isSignedIn, imageUrl,route, box } = this.state;
     return (
      <div className="App">

        <ParticlesBg num={23} type="cobweb" bg={true} className="particles"/>
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
         ? <div>
            <Logo />
            <Rank />
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />     
            <FaceRecognition box={box} imageUrl={imageUrl} />
         </div>
         : (
          route === 'signin' ?
          <Signin onRouteChange={this.onRouteChange} /> :
          <Register onRouteChange={this.onRouteChange} />

         )

        }
      </div>
  );
  }
}


export default App;
