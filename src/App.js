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

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box:{},
      route: 'signin',
      isSignedIn: false,
      isDetecting: false,
      detectionError: '',
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }});
  }

  calculateFaceLocation = (data) => {
    const faceRectangle = data.faces[0].face_rectangle;
    const image = document.getElementById('inputimage');
    const displayWidth = Number(image.width);
    const displayHeight = Number(image.height);
    const naturalWidth = Number(image.naturalWidth);
    const naturalHeight = Number(image.naturalHeight);

    const scaleX = displayWidth / naturalWidth;
    const scaleY = displayHeight / naturalHeight;

    return {
        leftCol: faceRectangle.left * scaleX,
        topRow: faceRectangle.top * scaleY,
        rightCol: displayWidth - (faceRectangle.left + faceRectangle.width) * scaleX,
        bottomRow: displayHeight - (faceRectangle.top + faceRectangle.height) * scaleY
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    if (!this.state.input) {
      return this.setState({ detectionError: 'Please enter a valid image URL.' });
    }
    this.setState({imageUrl: this.state.input, isDetecting: true, detectionError: '', box: {}});

    fetch('http://localhost:3000/clarifai', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          imageUrl: this.state.input
        })
    })
    .then(response => response.json())
    .then(response => {
      if (response && response.faces && response.faces.length > 0 ) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(prevState => ({
            user: {
              ...prevState.user,
              entries: typeof count === 'object' ? (count.entries || count[0]?.entries || count[0]) : count
            }
          }));
        })
        .catch(err => {
          console.log('Error updating entries:', err);
          this.setState({ isDetecting: false });
        });

        this.displayFaceBox(this.calculateFaceLocation(response));
      } 
    })
    .catch(error => {
      console.log('No faces detected or unexpected API response', error);
      this.setState({ detectionError: 'No faces detected or unexpected API response.', isDetecting: false });
    });
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
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />     
            <FaceRecognition box={box} imageUrl={imageUrl} />
         </div>
         : (
          route === 'signin' ?
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> :
          <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />

         )

        }
      </div>
  );
  }
}


export default App;
